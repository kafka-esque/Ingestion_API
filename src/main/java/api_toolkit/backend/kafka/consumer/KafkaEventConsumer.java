package api_toolkit.backend.kafka.consumer;

import api_toolkit.backend.kafka.event.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * Kafka Event Consumer Service
 * 
 * Listens to and processes events from Kafka topics.
 * This is a template/example implementation that can be extended
 * based on business requirements.
 */
@Slf4j
@Service
public class KafkaEventConsumer {

    /**
     * Listen to project events
     */
    @KafkaListener(
        topics = "project-events",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeProjectEvent(
            @Payload ProjectEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION_ID) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        try {
            log.info("Received PROJECT event from topic: {}, partition: {}, offset: {}", topic, partition, offset);
            log.info("Event Details - ID: {}, Type: {}, ProjectName: {}", 
                event.getEventId(), event.getEventType(), event.getProjectName());

            // Process the event based on type
            switch (event.getEventType()) {
                case "PROJECT_CREATED":
                    handleProjectCreated(event);
                    break;
                case "PROJECT_UPDATED":
                    handleProjectUpdated(event);
                    break;
                case "PROJECT_DELETED":
                    handleProjectDeleted(event);
                    break;
                default:
                    log.warn("Unknown project event type: {}", event.getEventType());
            }

            // Acknowledge after successful processing
            acknowledgment.acknowledge();
            log.info("PROJECT event processed successfully");
        } catch (Exception e) {
            log.error("Error processing PROJECT event: {}", event.getEventId(), e);
            // Don't acknowledge - message will be retried
        }
    }

    /**
     * Listen to user events
     */
    @KafkaListener(
        topics = "user-events",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeUserEvent(
            @Payload UserEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION_ID) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        try {
            log.info("Received USER event from topic: {}, partition: {}, offset: {}", topic, partition, offset);
            log.info("Event Details - ID: {}, Type: {}, Username: {}", 
                event.getEventId(), event.getEventType(), event.getUsername());

            // Process the event based on type
            switch (event.getEventType()) {
                case "USER_REGISTERED":
                    handleUserRegistered(event);
                    break;
                case "USER_UPDATED":
                    handleUserUpdated(event);
                    break;
                case "USER_DELETED":
                    handleUserDeleted(event);
                    break;
                default:
                    log.warn("Unknown user event type: {}", event.getEventType());
            }

            acknowledgment.acknowledge();
            log.info("USER event processed successfully");
        } catch (Exception e) {
            log.error("Error processing USER event: {}", event.getEventId(), e);
        }
    }

    /**
     * Listen to analytics events
     */
    @KafkaListener(
        topics = "analytics-events",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeAnalyticsEvent(
            @Payload AnalyticsEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION_ID) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        try {
            log.info("Received ANALYTICS event from topic: {}, partition: {}, offset: {}", topic, partition, offset);
            log.info("Event Details - ID: {}, Metric: {}, Value: {}", 
                event.getEventId(), event.getMetricName(), event.getMetricValue());

            // Process analytics data
            handleAnalyticsMetric(event);

            acknowledgment.acknowledge();
            log.info("ANALYTICS event processed successfully");
        } catch (Exception e) {
            log.error("Error processing ANALYTICS event: {}", event.getEventId(), e);
        }
    }

    /**
     * Listen to notification events
     */
    @KafkaListener(
        topics = "notification-events",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeNotificationEvent(
            @Payload NotificationEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION_ID) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {
        try {
            log.info("Received NOTIFICATION event from topic: {}, partition: {}, offset: {}", topic, partition, offset);
            log.info("Event Details - ID: {}, Type: {}, To: {}", 
                event.getEventId(), event.getNotificationType(), event.getRecipientEmail());

            // Process notification based on type
            switch (event.getNotificationType()) {
                case "EMAIL":
                    handleEmailNotification(event);
                    break;
                case "SMS":
                    handleSmsNotification(event);
                    break;
                case "IN_APP":
                    handleInAppNotification(event);
                    break;
                default:
                    log.warn("Unknown notification type: {}", event.getNotificationType());
            }

            acknowledgment.acknowledge();
            log.info("NOTIFICATION event processed successfully");
        } catch (Exception e) {
            log.error("Error processing NOTIFICATION event: {}", event.getEventId(), e);
        }
    }

    // Event handler methods
    private void handleProjectCreated(ProjectEvent event) {
        log.info("Handling PROJECT_CREATED event for project: {}", event.getProjectName());
        // Implement business logic: Update cache, send notifications, etc.
    }

    private void handleProjectUpdated(ProjectEvent event) {
        log.info("Handling PROJECT_UPDATED event for project: {}", event.getProjectName());
        // Implement business logic
    }

    private void handleProjectDeleted(ProjectEvent event) {
        log.info("Handling PROJECT_DELETED event for project: {}", event.getProjectName());
        // Implement business logic: Clean up related data, etc.
    }

    private void handleUserRegistered(UserEvent event) {
        log.info("Handling USER_REGISTERED event for user: {}", event.getUsername());
        // Implement business logic: Send welcome email, initialize user profile, etc.
    }

    private void handleUserUpdated(UserEvent event) {
        log.info("Handling USER_UPDATED event for user: {}", event.getUsername());
        // Implement business logic
    }

    private void handleUserDeleted(UserEvent event) {
        log.info("Handling USER_DELETED event for user: {}", event.getUsername());
        // Implement business logic: Archive user data, etc.
    }

    private void handleAnalyticsMetric(AnalyticsEvent event) {
        log.info("Handling ANALYTICS metric: {} = {}", event.getMetricName(), event.getMetricValue());
        // Implement business logic: Store in time-series DB, update dashboards, etc.
    }

    private void handleEmailNotification(NotificationEvent event) {
        log.info("Handling EMAIL notification to: {}", event.getRecipientEmail());
        // Implement business logic: Send email via mail service
    }

    private void handleSmsNotification(NotificationEvent event) {
        log.info("Handling SMS notification to: {}", event.getRecipientId());
        // Implement business logic: Send SMS via SMS provider
    }

    private void handleInAppNotification(NotificationEvent event) {
        log.info("Handling IN_APP notification for user: {}", event.getRecipientId());
        // Implement business logic: Store notification in DB for in-app display
    }
}
