package api_toolkit.controller;

import api_toolkit.dto.ProjectOperationDTO;
import api_toolkit.service.ProjectOperationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for project-operation mapping management.
 * Handles associations between projects and their available operations.
 * Provides endpoints for managing project operation configurations.
 */
@RestController
@RequestMapping("/api/project-operations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class ProjectOperationController {

    private final ProjectOperationService projectOperationService;

    /**
     * Get all project-operation mappings.
     */
    @GetMapping
    public ResponseEntity<List<ProjectOperationDTO>> getAll() {
        log.debug("Fetching all project-operation mappings");
        return ResponseEntity.ok(projectOperationService.getAllMappings());
    }

    /**
     * Create new project-operation mapping.
     */
    @PostMapping
    public ResponseEntity<ProjectOperationDTO> add(@Valid @RequestBody ProjectOperationDTO dto) {
        log.debug("Creating project-operation mapping for project: {}", dto.getProjectId());
        return ResponseEntity.ok(projectOperationService.addMapping(dto));
    }

    /**
     * Delete project-operation mapping by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.debug("Deleting project-operation mapping with ID: {}", id);
        projectOperationService.deleteMapping(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get operations associated with specific project.
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectOperationDTO>> getOperationsByProjectId(@PathVariable Long projectId) {
        log.debug("Fetching operations for project ID: {}", projectId);
        return ResponseEntity.ok(projectOperationService.getMappingsByProjectId(projectId));
    }

    /**
     * Add multiple operations to a project at once.
     */
    @PostMapping("/project/{projectId}/operations")
    public ResponseEntity<List<ProjectOperationDTO>> addOperationsToProject(
            @PathVariable Long projectId, @RequestBody List<Long> operationServiceIds) {
        log.debug("Adding {} operations to project ID: {}", operationServiceIds.size(), projectId);
        return ResponseEntity.ok(projectOperationService.addOperationsToProject(projectId, operationServiceIds));
    }
}
