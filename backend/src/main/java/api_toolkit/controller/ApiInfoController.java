package api_toolkit.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Arrays;

/**
 * API Documentation and Info Controller.
 * Beginner-friendly: Shows API discovery patterns and endpoint documentation.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Slf4j
public class ApiInfoController {

    private static final String API_VERSION = "1.0.0";
    private static final String[] STANDARD_METHODS = {"GET", "POST", "PUT", "DELETE"};

    /** Get API information and available endpoints */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getApiInfo() {
        log.debug("Request for API information");
        return ResponseEntity.ok(Map.of(
            "name", "API Toolkit Backend",
            "version", API_VERSION,
            "status", "running",
            "endpoints", buildEndpointsMap(),
            "healthCheck", "/api/health",
            "documentation", "Visit individual endpoints for detailed API documentation"
        ));
    }

    /** Health check for the entire API */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> apiHealthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "API Toolkit Backend",
            "timestamp", System.currentTimeMillis(),
            "availableEndpoints", 9
        ));
    }

    // Helper method to build endpoints map
    private Map<String, Object> buildEndpointsMap() {
        return Map.of(
            "projects", createEndpoint("/api/projects", "Manage projects"),
            "users", createEndpoint("/api/users", "Manage users"),
            "operationServices", createEndpoint("/api/operation-services", "Manage operation services"),
            "projectOperations", createEndpoint("/api/project-operations", "Manage project-operation relationships"),
            "contacts", createEndpoint("/api/contacts", "Manage contacts"),
            "istServers", createEndpoint("/api/ist-server", "Manage IST servers"),
            "domains", createEndpoint("/api/domain", "Manage domains"),
            "domainVersions", createEndpoint("/api/domain-version", "Manage domain versions"),
            "projectContacts", createEndpoint("/api/project-contacts", "Manage project-contact relationships")
        );
    }

    /** Create endpoint definition map */
    private Map<String, Object> createEndpoint(String path, String description) {
        return Map.of(
            "path", path,
            "description", description,
            "methods", Arrays.asList(STANDARD_METHODS)
        );
    }
}
