package api_toolkit.service;

import api_toolkit.dto.ProjectDTO;
import api_toolkit.entity.*;
import api_toolkit.exception.*;
import api_toolkit.mapper.ProjectMapper;
import api_toolkit.repository.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing project operations.
 * Handles CRUD operations, user permissions, and project relationships.
 * Provides role-based access control and comprehensive audit logging.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final IstServerRepository istServerRepository;
    private final ProjectMapper projectMapper;
    private final AuthorizationService authorizationService;
    private final AuditService auditService;

    /** Get all projects (Admin and Onboarding only) */
    @Transactional(readOnly = true)
    public List<ProjectDTO> getAllProjects() {
        log.debug("Fetching all projects");
        authorizationService.requireAdminOrOnboardingPermissions();
        
        List<ProjectEntity> projects = projectRepository.findAll();
        log.debug("Found {} projects", projects.size());
        
        return mapToDTO(projects);
    }

    /** Get project by ID with authorization check */
    @Transactional(readOnly = true)
    public ProjectDTO getProjectById(Long id) {
        log.debug("Fetching project with ID: {}", id);
        return projectMapper.toDTO(findProjectById(id));
    }

    /** Create new project with validation and audit logging */
    public ProjectDTO createProject(ProjectDTO dto) {
        log.debug("Creating project: {}", dto.getProjectName());
        
        validateProjectInput(dto);
        UserEntity currentUser = authorizationService.getCurrentUser();
        UserEntity user = findUserById(dto.getUserId());
        
        validateUniqueProjectIdentifier(dto.getUserId(), dto.getProjectIdentifier(), null);
        
        IstServerEntity istServer = dto.getIstServerId() != null ? 
                findIstServerById(dto.getIstServerId()) : null;

        ProjectEntity entity = createProjectEntity(dto, user, istServer, currentUser);
        ProjectEntity savedProject = projectRepository.save(entity);
        
        log.info("Created project ID: {} name: {} by user '{}' ({})", 
                savedProject.getId(), savedProject.getProjectName(), 
                currentUser.getName(), currentUser.getRole());
        return projectMapper.toDTO(savedProject);
    }

    /** Update an existing project */
    public ProjectDTO updateProject(Long id, ProjectDTO dto) {
        log.debug("Updating project with ID: {}", id);
        
        validateProjectInput(dto);
        ProjectEntity existing = findProjectById(id);
        UserEntity currentUser = authorizationService.getCurrentUser();
        
        checkUpdatePermissions(existing, currentUser);
        UserEntity originalOwner = existing.getUser();
        
        updateProjectEntity(existing, dto, currentUser);
        ProjectEntity updated = projectRepository.save(existing);
        
        logUpdateOperation(updated, originalOwner, currentUser);
        return projectMapper.toDTO(updated);
    }

    /** Delete a project */
    public void deleteProject(Long id) {
        log.debug("Deleting project with ID: {}", id);
        
        ProjectEntity entity = findProjectById(id);
        UserEntity currentUser = authorizationService.getCurrentUser();
        
        checkDeletePermissions(entity, currentUser);
        handleAdminDeleteAudit(entity, currentUser);
        
        projectRepository.deleteById(id);
        log.info("Deleted project with ID: {}", id);
    }

    /** Get projects by user ID */
    @Transactional(readOnly = true)
    public List<ProjectDTO> getProjectsByUserId(Long userId) {
        log.debug("Fetching projects for user ID: {}", userId);
        
        findUserById(userId); // Validate user exists
        UserEntity currentUser = authorizationService.getCurrentUser();
        checkUserAccessPermissions(currentUser, userId);
        
        List<ProjectEntity> userProjects = projectRepository.findAll()
                .stream()
                .filter(project -> project.getUser() != null && project.getUser().getId().equals(userId))
                .collect(Collectors.toList());
                
        log.debug("Found {} projects for user ID: {}", userProjects.size(), userId);
        return mapToDTO(userProjects);
    }

    /** Get projects for the current authenticated user */
    @Transactional(readOnly = true)
    public List<ProjectDTO> getCurrentUserProjects() {
        UserEntity currentUser = authorizationService.getCurrentUser();
        log.debug("Fetching projects for current user ID: {}", currentUser.getId());
        return getProjectsByUserId(currentUser.getId());
    }

    // Helper methods - streamlined validation and operations

    /** Find project by ID or throw exception */
    private ProjectEntity findProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));
    }

    /** Find user by ID or throw exception */
    private UserEntity findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
    }

    /** Find IST server by ID or throw exception */
    private IstServerEntity findIstServerById(Long istServerId) {
        return istServerRepository.findById(istServerId)
                .orElseThrow(() -> new ResourceNotFoundException("IST Server not found with ID: " + istServerId));
    }

    /** Validate unique project identifier */
    private void validateUniqueProjectIdentifier(Long userId, String identifier, Long excludeId) {
        ProjectEntity existing = projectRepository.findByUserIdAndProjectIdentifier(userId, identifier);
        if (existing != null && (excludeId == null || !existing.getId().equals(excludeId))) {
            throw new ResourceConflictException("A project with identifier '" + identifier + 
                    "' already exists for this user. Please choose a different project identifier.");
        }
    }

    /** Create project entity with audit fields */
    private ProjectEntity createProjectEntity(ProjectDTO dto, UserEntity user, IstServerEntity istServer, UserEntity currentUser) {
        ProjectEntity entity = projectMapper.toEntity(dto);
        entity.setUser(user);
        entity.setIstServer(istServer);
        
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        entity.setLastModifiedByUserId(currentUser.getId());
        entity.setLastModifiedByUsername(currentUser.getName());
        entity.setLastModifiedByRole(currentUser.getRole());
        
        return entity;
    }

    /** Check update permissions */
    private void checkUpdatePermissions(ProjectEntity existing, UserEntity currentUser) {
        if (!authorizationService.hasAnyRole("ADMIN", "ONBOARDING")) {
            if (!existing.getUser().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Access denied. You can only update your own projects.");
            }
        }
    }

    /** Update project entity fields */
    private void updateProjectEntity(ProjectEntity existing, ProjectDTO dto, UserEntity currentUser) {
        projectMapper.updateEntity(existing, dto);

        if (dto.getUserId() != null) {
            existing.setUser(findUserById(dto.getUserId()));
        }

        if (dto.getProjectIdentifier() != null && !dto.getProjectIdentifier().equals(existing.getProjectIdentifier())) {
            Long targetUserId = dto.getUserId() != null ? dto.getUserId() : existing.getUser().getId();
            validateUniqueProjectIdentifier(targetUserId, dto.getProjectIdentifier(), existing.getId());
        }

        if (dto.getIstServerId() != null) {
            existing.setIstServer(findIstServerById(dto.getIstServerId()));
        } else {
            existing.setIstServer(null);
        }

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        existing.setUpdatedAt(now);
        existing.setLastModifiedByUserId(currentUser.getId());
        existing.setLastModifiedByUsername(currentUser.getName());
        existing.setLastModifiedByRole(currentUser.getRole());
    }

    /** Log update operation */
    private void logUpdateOperation(ProjectEntity updated, UserEntity originalOwner, UserEntity currentUser) {
        boolean isAdminOrOnboardingUpdate = authorizationService.hasAnyRole("ADMIN", "ONBOARDING") 
                && !currentUser.getId().equals(originalOwner.getId());

        if (isAdminOrOnboardingUpdate) {
            log.info("Project ID: {} owned by user '{}' (ID: {}) was updated by {} '{}' (ID: {})", 
                    updated.getId(), originalOwner.getName(), originalOwner.getId(),
                    currentUser.getRole(), currentUser.getName(), currentUser.getId());
        } else {
            log.info("Updated project with ID: {} and name: {} by owner '{}' ({})", 
                    updated.getId(), updated.getProjectName(), 
                    currentUser.getName(), currentUser.getRole());
        }
    }

    /** Check delete permissions */
    private void checkDeletePermissions(ProjectEntity entity, UserEntity currentUser) {
        boolean isAdminOrOnboarding = authorizationService.hasAnyRole("ADMIN", "ONBOARDING");
        if (!isAdminOrOnboarding && !entity.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied. You can only delete your own projects.");
        }
    }

    /** Handle admin delete audit and notifications */
    private void handleAdminDeleteAudit(ProjectEntity entity, UserEntity currentUser) {
        boolean isAdminOrOnboarding = authorizationService.hasAnyRole("ADMIN", "ONBOARDING");
        if (isAdminOrOnboarding && !entity.getUser().getId().equals(currentUser.getId())) {
            auditService.logProjectDeletion(currentUser, entity.getUser(), entity.getId(), entity.getProjectIdentifier());
            auditService.notifyUserProjectDeleted(entity.getUser(), entity.getProjectIdentifier(), currentUser);
        }
    }

    /** Check user access permissions */
    private void checkUserAccessPermissions(UserEntity currentUser, Long userId) {
        if (!authorizationService.hasAnyRole("ADMIN", "ONBOARDING")) {
            if (!currentUser.getId().equals(userId)) {
                throw new AccessDeniedException("Access denied. You can only view your own projects.");
            }
        }
    }

    /** Convert entity list to DTO list with error handling */
    private List<ProjectDTO> mapToDTO(List<ProjectEntity> projects) {
        return projects.stream()
                .map(project -> {
                    try {
                        return projectMapper.toDTO(project);
                    } catch (Exception e) {
                        log.error("Error mapping project ID {} to DTO: {}", 
                                project != null ? project.getId() : "null", e.getMessage());
                        if (project != null) {
                            log.error("Problematic project - ID: {}, Name: {}, User: {}, IST Server: {}", 
                                    project.getId(), project.getProjectName(),
                                    project.getUser() != null ? project.getUser().getId() : "null",
                                    project.getIstServer() != null ? project.getIstServer().getId() : "null");
                        }
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    /**
     * Validate project input data
     * @param dto Project DTO to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateProjectInput(ProjectDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Project data cannot be null");
        }
        
        if (dto.getUserId() == null || dto.getUserId() <= 0) {
            throw new IllegalArgumentException("Valid User ID is required and must be greater than 0");
        }
        
        // Additional business validations can be added here
        if (dto.getProjectIdentifier() != null && dto.getProjectIdentifier().trim().isEmpty()) {
            throw new IllegalArgumentException("Project Identifier cannot be empty");
        }
        
        if (dto.getProjectName() != null && dto.getProjectName().trim().isEmpty()) {
            throw new IllegalArgumentException("Project Name cannot be empty");
        }
    }
}
