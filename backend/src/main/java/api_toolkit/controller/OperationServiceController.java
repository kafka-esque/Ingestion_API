package api_toolkit.controller;

import api_toolkit.dto.OperationServiceDTO;
import api_toolkit.service.OperationServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Operation Service management.
 * Beginner-friendly: Shows CRUD operations, validation, and REST patterns.
 */
@RestController
@RequestMapping("/api/operation-services")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class OperationServiceController {

    private final OperationServiceService operationServiceService;

    /** Get all operation services */
    @GetMapping
    public ResponseEntity<List<OperationServiceDTO>> getAllOperationServices() {
        log.debug("Request to get all operation services");
        return ResponseEntity.ok(operationServiceService.getAllOperationServices());
    }

    /** Get operation service by ID */
    @GetMapping("/{id}")
    public ResponseEntity<OperationServiceDTO> getOperationServiceById(@PathVariable Long id) {
        log.debug("Request to get operation service with ID: {}", id);
        return ResponseEntity.ok(operationServiceService.getOperationServiceById(id));
    }

    /** Create a new operation service */
    @PostMapping
    public ResponseEntity<OperationServiceDTO> createOperationService(@Valid @RequestBody OperationServiceDTO dto) {
        log.debug("Request to create operation service: {}", dto.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(operationServiceService.createOperationService(dto));
    }

    /** Update operation service by ID */
    @PutMapping("/{id}")
    public ResponseEntity<OperationServiceDTO> updateOperationService(@PathVariable Long id, @Valid @RequestBody OperationServiceDTO dto) {
        log.debug("Request to update operation service with ID: {}", id);
        return ResponseEntity.ok(operationServiceService.updateOperationService(id, dto));
    }

    /** Delete operation service by ID */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteOperationService(@PathVariable Long id) {
        log.debug("Request to delete operation service with ID: {}", id);
        operationServiceService.deleteOperationService(id);
        return ResponseEntity.ok(createSuccessResponse("Operation service deleted successfully", "deletedId", id));
    }

    /** Get operation services by domain ID */
    @GetMapping("/domain/{domainId}")
    public ResponseEntity<List<OperationServiceDTO>> getOperationServicesByDomainId(@PathVariable Long domainId) {
        log.debug("Request to get operation services for domain ID: {}", domainId);
        return ResponseEntity.ok(operationServiceService.getOperationServicesByDomainId(domainId));
    }

    /** Get operation services by version ID */
    @GetMapping("/version/{versionId}")
    public ResponseEntity<List<OperationServiceDTO>> getOperationServicesByVersionId(@PathVariable Long versionId) {
        log.debug("Request to get operation services for version ID: {}", versionId);
        return ResponseEntity.ok(operationServiceService.getOperationServicesByVersionId(versionId));
    }

    /** Get operation services by domain ID and version ID */
    @GetMapping("/domain/{domainId}/version/{versionId}")
    public ResponseEntity<List<OperationServiceDTO>> getOperationServicesByDomainAndVersion(
            @PathVariable Long domainId, @PathVariable Long versionId) {
        log.debug("Request to get operation services for domain ID: {} and version ID: {}", domainId, versionId);
        return ResponseEntity.ok(operationServiceService.getOperationServicesByDomainAndVersion(domainId, versionId));
    }

    /** Check if operation service exists by name and domain */
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Object>> checkOperationServiceExists(
            @RequestParam String operationName, @RequestParam Long domainId) {
        log.debug("Request to check if operation service '{}' exists for domain ID: {}", operationName, domainId);
        boolean exists = operationServiceService.existsByNameAndDomain(operationName, domainId);
        return ResponseEntity.ok(Map.of("exists", exists, "operationName", operationName, "domainId", domainId));
    }

    /** Health check endpoint */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(createHealthResponse("OperationServiceController"));
    }

    // Helper methods for consistent response patterns

    /** Create success response with additional data */
    private Map<String, Object> createSuccessResponse(String message, String dataKey, Object dataValue) {
        return Map.of("success", true, "message", message, dataKey, dataValue);
    }

    /** Create health check response */
    private Map<String, Object> createHealthResponse(String serviceName) {
        return Map.of("status", "UP", "service", serviceName, "timestamp", System.currentTimeMillis());
    }
}
