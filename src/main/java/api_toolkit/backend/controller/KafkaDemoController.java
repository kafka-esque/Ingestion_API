package api_toolkit.backend.controller;

import api_toolkit.backend.dto.ApiResponse;
import api_toolkit.backend.kafka.event.*;
import api_toolkit.backend.kafka.producer.KafkaEventProducer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Kafka Demo Controller
 * 
 * Provides endpoints to test Kafka event production.
 * This is a demo controller for development and testing purposes.
 */
@Slf4j
@RestController
@RequestMapping("/kafka-demo")
@Tag(name = "Kafka Demo", description = "Kafka event production demo endpoints")
public class KafkaDemoController {

    @Autowired
    private KafkaEventProducer kafkaEventProducer;

    @PostMapping("/project/create")
    @Operation(summary = "Demo: Publish a project created event")
    public ResponseEntity<ApiResponse<?>> publishProjectCreatedEvent(
            @RequestParam(required = false, defaultValue = "proj-123") String projectId,
            @RequestParam(required = false, defaultValue = "My Project") String projectName,
            @RequestParam(required = false, defaultValue = "user-456") String ownerId) {
        
        try {
            ProjectEvent event = new ProjectEvent("PROJECT_CREATED", projectId, projectName, ownerId);
            event.setDescription("A sample project created via API");
            event.setStatus("ACTIVE");
            
            kafkaEventProducer.publishProjectEvent(event);
            
            return ResponseEntity.ok(ApiResponse.success(
                "Project created event published successfully", 
                event
            ));
        } catch (Exception e) {
            log.error("Error publishing project event", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(
                "Failed to publish project event: " + e.getMessage(),
                "KAFKA_ERROR"
            ));
        }
    }

    @PostMapping("/project/update")
    @Operation(summary = "Demo: Publish a project updated event")
    public ResponseEntity<ApiResponse<?>> publishProjectUpdatedEvent(
            @RequestParam(required = false, defaultValue = "proj-123") String projectId,
            @RequestParam(required = false, defaultValue = "Updated Project") String projectName) {
        
        try {
            ProjectEvent event = new ProjectEvent("PROJECT_UPDATED", projectId, projectName, "user-456");
            event.setStatus("UPDATED");
            
            kafkaEventProducer.publishProjectEvent(event);
            
            return ResponseEntity.ok(ApiResponse.success(
                "Project updated event published successfully", 
                event
            ));
        } catch (Exception e) {
            log.error("Error publishing project event", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(
                "Failed to publish project event: " + e.getMessage(),
                "KAFKA_ERROR"
            ));
        }
    }

    @PostMapping("/user/register")
    @Operation(summary = "Demo: Publish a user registered event")
    public ResponseEntity<ApiResponse<?>> publishUserRegisteredEvent(
            @RequestParam(required = false, defaultValue = "user-123") String userId,
            @RequestParam(required = false, defaultValue = "john_doe") String username,
            @RequestParam(required = false, defaultValue = "john@example.com") String email) {
        
        try {
            UserEvent event = new UserEvent("USER_REGISTERED", userId, username, email);
            event.setRole("USER");
            
            kafkaEventProducer.publishUserEvent(event);
            
            return ResponseEntity.ok(ApiResponse.success(
                "User registered event published successfully", 
                event
            ));
        } catch (Exception e) {
            log.error("Error publishing user event", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(
                "Failed to publish user event: " + e.getMessage(),
                "KAFKA_ERROR"
            ));
        }
    }

    @PostMapping("/analytics/metric")
    @Operation(summary = "Demo: Publish an analytics event")
    public ResponseEntity<ApiResponse<?>> publishAnalyticsEvent(
            @RequestParam(required = false, defaultValue = "api.response.time") String metricName,
            @RequestParam(required = false, defaultValue = "250.5") Double metricValue) {
        
        try {
            AnalyticsEvent event = new AnalyticsEvent("METRIC_RECORDED", metricName, metricValue);
            event.getTags().put("service", "api-toolkit");
            event.getTags().put("environment", "dev");
            
            kafkaEventProducer.publishAnalyticsEvent(event);
            
            return ResponseEntity.ok(ApiResponse.success(
                "Analytics event published successfully", 
                event
            ));
        } catch (Exception e) {
            log.error("Error publishing analytics event", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(
                "Failed to publish analytics event: " + e.getMessage(),
                "KAFKA_ERROR"
            ));
        }
    }

    @PostMapping("/notification/email")
    @Operation(summary = "Demo: Publish an email notification event")
    public ResponseEntity<ApiResponse<?>> publishEmailNotificationEvent(
            @RequestParam(required = false, defaultValue = "user-123") String recipientId,
            @RequestParam(required = false, defaultValue = "user@example.com") String recipientEmail,
            @RequestParam(required = false, defaultValue = "Welcome!") String subject,
            @RequestParam(required = false, defaultValue = "Welcome to API Toolkit!") String message) {
        
        try {
            NotificationEvent event = new NotificationEvent(
                "NOTIFICATION_SENT",
                recipientId,
                recipientEmail,
                "EMAIL",
                subject,
                message
            );
            event.setPriority("HIGH");
            
            kafkaEventProducer.publishNotificationEvent(event);
            
            return ResponseEntity.ok(ApiResponse.success(
                "Email notification event published successfully", 
                event
            ));
        } catch (Exception e) {
            log.error("Error publishing notification event", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(
                "Failed to publish notification event: " + e.getMessage(),
                "KAFKA_ERROR"
            ));
        }
    }

    @GetMapping("/status")
    @Operation(summary = "Check Kafka integration status")
    public ResponseEntity<ApiResponse<?>> getKafkaStatus() {
        return ResponseEntity.ok(ApiResponse.success(
            "Kafka integration is active and ready",
            java.util.Map.of(
                "status", "RUNNING",
                "bootstrap_servers", "${spring.kafka.bootstrap-servers}",
                "consumer_group", "${spring.kafka.consumer.group-id}",
                "topics", java.util.List.of(
                    KafkaEventProducer.PROJECT_EVENTS_TOPIC,
                    KafkaEventProducer.USER_EVENTS_TOPIC,
                    KafkaEventProducer.ANALYTICS_EVENTS_TOPIC,
                    KafkaEventProducer.NOTIFICATION_EVENTS_TOPIC
                )
            )
        ));
    }
}
