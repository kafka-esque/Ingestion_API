package api_toolkit.controller;

import api_toolkit.dto.ProjectDTO;
import api_toolkit.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Project management.
 * Beginner-friendly: Shows CRUD operations, validation, role-based access, and error handling.
 */
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ProjectController {

    private final ProjectService projectService;

    /** GET all projects (Admin and Onboarding only) */
    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        log.debug("Request to get all projects");
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    /** GET a project by ID */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long id) {
        log.debug("Request to get project with ID: {}", id);
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    /** CREATE a new project */
    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@Valid @RequestBody ProjectDTO projectDTO) {
        log.debug("Request to create project: {}", projectDTO.getProjectName());
        validateUserId(projectDTO.getUserId(), "create");
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(projectDTO));
    }

    /** UPDATE an existing project */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectDTO projectDTO) {
        log.debug("Request to update project with ID: {}", id);
        validateUserId(projectDTO.getUserId(), "update");
        return ResponseEntity.ok(projectService.updateProject(id, projectDTO));
    }

    /** DELETE a project */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteProject(@PathVariable Long id) {
        log.debug("Request to delete project with ID: {}", id);
        projectService.deleteProject(id);
        return ResponseEntity.ok(createSuccessResponse("Project deleted successfully", "deletedId", id));
    }

    /** GET projects by user ID */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectDTO>> getProjectsByUserId(@PathVariable Long userId) {
        log.debug("Request to get projects for user ID: {}", userId);
        return ResponseEntity.ok(projectService.getProjectsByUserId(userId));
    }

    /** GET current user's projects */
    @GetMapping("/my-projects")
    public ResponseEntity<List<ProjectDTO>> getCurrentUserProjects() {
        log.debug("Request to get current user's projects");
        return ResponseEntity.ok(projectService.getCurrentUserProjects());
    }

    /** Health check endpoint */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(createHealthResponse("ProjectController"));
    }

    /** Data integrity check endpoint */
    @GetMapping("/integrity-check")
    public ResponseEntity<Map<String, Object>> dataIntegrityCheck() {
        log.debug("Request for data integrity check");
        try {
            return ResponseEntity.ok(performIntegrityCheck());
        } catch (Exception e) {
            log.error("Error during data integrity check: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("ERROR", e.getMessage()));
        }
    }

    // Helper methods for validation and response creation

    /** Validate user ID */
    private void validateUserId(Long userId, String operation) {
        if (userId == null || userId <= 0) {
            log.error("Invalid userId provided for {}: {}", operation, userId);
            throw new IllegalArgumentException("Valid User ID is required and must be greater than 0");
        }
    }

    /** Create success response with additional data */
    private Map<String, Object> createSuccessResponse(String message, String dataKey, Object dataValue) {
        return Map.of("success", true, "message", message, dataKey, dataValue);
    }

    /** Create health check response */
    private Map<String, Object> createHealthResponse(String serviceName) {
        return Map.of("status", "UP", "service", serviceName, "timestamp", System.currentTimeMillis());
    }

    /** Create error response */
    private Map<String, Object> createErrorResponse(String status, String error) {
        return Map.of("status", status, "error", error, "timestamp", System.currentTimeMillis());
    }

    /** Perform data integrity check and return results */
    private Map<String, Object> performIntegrityCheck() {
        List<ProjectDTO> projects = projectService.getAllProjects();
        long totalProjects = projects.size();
        long projectsWithUsers = projects.stream()
                .filter(p -> p.getUserId() != null && p.getUserId() > 0)
                .count();
        long projectsWithIstServers = projects.stream()
                .filter(p -> p.getIstServerId() != null && p.getIstServerId() > 0)
                .count();
        
        return Map.of(
            "status", "SUCCESS",
            "totalProjects", totalProjects,
            "projectsWithValidUsers", projectsWithUsers,
            "projectsWithIstServers", projectsWithIstServers,
            "projectsWithInvalidUsers", totalProjects - projectsWithUsers,
            "timestamp", System.currentTimeMillis()
        );
    }
}