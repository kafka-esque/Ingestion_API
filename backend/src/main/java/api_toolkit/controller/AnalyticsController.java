package api_toolkit.controller;

import api_toolkit.dto.AnalyticsDTO;
import api_toolkit.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Analytics and Usage Statistics.
 * Beginner-friendly: Shows REST API patterns, logging, and error handling.
 */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /** Get current user's analytics */
    @GetMapping("/user")
    public ResponseEntity<AnalyticsDTO.UserAnalytics> getCurrentUserAnalytics() {
        log.debug("Request to get current user analytics");
        return ResponseEntity.ok(analyticsService.getCurrentUserAnalytics());
    }

    /** Get analytics for a specific user (admin/onboarding only) */
    @GetMapping("/user/{userId}")
    public ResponseEntity<AnalyticsDTO.UserAnalytics> getUserAnalytics(@PathVariable Long userId) {
        log.debug("Request to get analytics for user ID: {}", userId);
        return ResponseEntity.ok(analyticsService.getUserAnalytics(userId));
    }

    /** Get system-wide analytics (admin/onboarding only) */
    @GetMapping("/system")
    public ResponseEntity<AnalyticsDTO.SystemAnalytics> getSystemAnalytics() {
        log.debug("Request to get system-wide analytics");
        return ResponseEntity.ok(analyticsService.getSystemAnalytics());
    }

    /** Get project statistics */
    @GetMapping("/projects/stats")
    public ResponseEntity<AnalyticsDTO.ProjectStats> getProjectStats() {
        log.debug("Request to get project statistics");
        return ResponseEntity.ok(analyticsService.getProjectStats());
    }

    /** Get contact statistics */
    @GetMapping("/contacts/stats")
    public ResponseEntity<AnalyticsDTO.ContactStats> getContactStats() {
        log.debug("Request to get contact statistics");
        return ResponseEntity.ok(analyticsService.getContactStats());
    }

    // Utility endpoints for monitoring and testing

    /** Health check endpoint for analytics service */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Analytics service is running");
    }

    /** Test endpoint to check basic functionality */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Analytics API is working");
    }

    /** Test endpoint with data counts for verification */
    @GetMapping("/test-counts")
    public ResponseEntity<String> testCounts() {
        return executeWithErrorHandling(() -> {
            long projectCount = analyticsService.getProjectStats().getTotalProjects();
            long contactCount = analyticsService.getContactStats().getTotalContacts();
            return String.format("Analytics Test - Projects: %d, Contacts: %d", projectCount, contactCount);
        }, "Error in analytics");
    }

    /** Cleanup database integrity issues */
    @PostMapping("/cleanup")
    public ResponseEntity<String> cleanupData() {
        return executeWithErrorHandling(() -> 
            analyticsService.cleanupDataIntegrity(), "Error during cleanup");
    }

    // Helper method for consistent error handling
    private ResponseEntity<String> executeWithErrorHandling(java.util.function.Supplier<String> operation, String errorPrefix) {
        try {
            return ResponseEntity.ok(operation.get());
        } catch (Exception e) {
            log.error("{}: {}", errorPrefix, e.getMessage(), e);
            return ResponseEntity.ok(errorPrefix + ": " + e.getMessage());
        }
    }
}
