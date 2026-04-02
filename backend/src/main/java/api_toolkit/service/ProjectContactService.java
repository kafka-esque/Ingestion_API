package api_toolkit.service;

import api_toolkit.dto.ProjectContactDTO;
import api_toolkit.entity.*;
import api_toolkit.exception.ResourceNotFoundException;
import api_toolkit.mapper.ProjectContactMapper;
import api_toolkit.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Project-Contact mapping service for managing associations between projects and contacts.
 * Beginner-friendly: Demonstrates many-to-many relationship management and batch operations.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProjectContactService {

    private final ProjectContactRepository projectContactRepository;
    private final ProjectRepository projectRepository;
    private final ContactRepository contactRepository;
    private final ProjectContactMapper projectContactMapper;

    /** Get all project-contact mappings */
    @Transactional(readOnly = true)
    public List<ProjectContactDTO> getAllMappings() {
        log.debug("Fetching all project-contact mappings");
        return mapToDTO(projectContactRepository.findAll());
    }

    /** Add new project-contact mapping */
    public ProjectContactDTO addMapping(ProjectContactDTO dto) {
        log.debug("Adding mapping for project {} and contact {}", dto.getProjectId(), dto.getContactId());
        
        ProjectEntity project = findProjectById(dto.getProjectId());
        ContactEntity contact = findContactById(dto.getContactId());
        
        ProjectContactEntity entity = projectContactMapper.toEntity(dto, project, contact);
        ProjectContactEntity saved = projectContactRepository.save(entity);
        
        log.info("Created project-contact mapping with ID: {}", saved.getId());
        return projectContactMapper.toDTO(saved);
    }

    /** Delete project-contact mapping */
    public void deleteMapping(Long id) {
        log.debug("Deleting project-contact mapping with ID: {}", id);
        
        if (!projectContactRepository.existsById(id)) {
            throw new ResourceNotFoundException("ProjectContact mapping not found with ID: " + id);
        }
        
        projectContactRepository.deleteById(id);
        log.info("Deleted project-contact mapping with ID: {}", id);
    }

    /** Get all contacts for a specific project */
    @Transactional(readOnly = true)
    public List<ProjectContactDTO> getContactsByProjectId(Long projectId) {
        log.debug("Fetching contacts for project ID: {}", projectId);
        return mapToDTO(projectContactRepository.findByProjectId(projectId));
    }

    /** Add multiple contacts to a project in batch */
    public List<ProjectContactDTO> addContactsToProject(Long projectId, List<Long> contactIds) {
        log.debug("Adding {} contacts to project ID: {}", contactIds.size(), projectId);
        
        ProjectEntity project = findProjectById(projectId);
        
        List<ProjectContactDTO> results = contactIds.stream()
                .map(contactId -> createProjectContactMapping(project, contactId))
                .collect(Collectors.toList());
        
        log.info("Added {} contacts to project ID: {}", results.size(), projectId);
        return results;
    }

    // Helper methods - streamlined lookup and creation

    /** Find project by ID or throw exception */
    private ProjectEntity findProjectById(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));
    }

    /** Find contact by ID or throw exception */
    private ContactEntity findContactById(Long contactId) {
        return contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with ID: " + contactId));
    }

    /** Create project-contact mapping for given project and contact ID */
    private ProjectContactDTO createProjectContactMapping(ProjectEntity project, Long contactId) {
        ContactEntity contact = findContactById(contactId);
        
        ProjectContactDTO dto = new ProjectContactDTO();
        dto.setProjectId(project.getId());
        dto.setContactId(contactId);
        
        ProjectContactEntity entity = projectContactMapper.toEntity(dto, project, contact);
        ProjectContactEntity saved = projectContactRepository.save(entity);
        
        return projectContactMapper.toDTO(saved);
    }

    /** Convert entity list to DTO list */
    private List<ProjectContactDTO> mapToDTO(List<ProjectContactEntity> entities) {
        return entities.stream().map(projectContactMapper::toDTO).collect(Collectors.toList());
    }
}
