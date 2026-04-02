package api_toolkit.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Arrays;

/**
 * Controller to handle legacy or incorrect operation endpoints
 * Provides information about correct endpoints
 */
@RestController
@RequestMapping("/api/operations")
@CrossOrigin(origins = "*")
@Slf4j
public class OperationsRedirectController {

    /**
     * Handle requests to /api/operations and provide information about correct endpoints
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getOperationsInfo() {
        log.info("Request to legacy /api/operations endpoint - providing redirect information");
        
        Map<String, Object> response = Map.of(
            "message", "The /api/operations endpoint has been moved",
            "correctEndpoints", Map.of(
                "operationServices", "/api/operation-services",
                "projectOperations", "/api/project-operations"
            ),
            "availableEndpoints", Arrays.asList(
                "/api/projects",
                "/api/users", 
                "/api/operation-services",
                "/api/project-operations",
                "/api/contacts",
                "/api/ist-server",
                "/api/domain",
                "/api/domain-version",
                "/api/project-contacts"
            ),
            "status", "redirect_info"
        );
        
        return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY).body(response);
    }

    /**
     * Handle POST requests to /api/operations
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> postOperationsInfo() {
        log.info("POST request to legacy /api/operations endpoint");
        
        Map<String, Object> response = Map.of(
            "message", "Please use the correct endpoint",
            "createOperationService", "POST /api/operation-services",
            "createProjectOperation", "POST /api/project-operations",
            "status", "endpoint_moved"
        );
        
        return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY).body(response);
    }

    /**
     * Handle PUT requests to /api/operations
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> putOperationsInfo(@PathVariable String id) {
        log.info("PUT request to legacy /api/operations/{} endpoint", id);
        
        Map<String, Object> response = Map.of(
            "message", "Please use the correct endpoint",
            "updateOperationService", "PUT /api/operation-services/" + id,
            "updateProjectOperation", "PUT /api/project-operations/" + id,
            "status", "endpoint_moved"
        );
        
        return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY).body(response);
    }

    /**
     * Handle DELETE requests to /api/operations
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteOperationsInfo(@PathVariable String id) {
        log.info("DELETE request to legacy /api/operations/{} endpoint", id);
        
        Map<String, Object> response = Map.of(
            "message", "Please use the correct endpoint",
            "deleteOperationService", "DELETE /api/operation-services/" + id,
            "deleteProjectOperation", "DELETE /api/project-operations/" + id,
            "status", "endpoint_moved"
        );
        
        return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY).body(response);
    }
}
