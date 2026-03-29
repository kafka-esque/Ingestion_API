package api_toolkit.backend.kafka.producer;

import api_toolkit.backend.kafka.event.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

/**
 * Kafka Event Producer Service
 * 
 * Responsible for publishing domain events to Kafka topics.
 * Provides methods to publish project, user, analytics, and notification events.
 */
@Slf4j
@Service
public class KafkaEventProducer {

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    // Topic Constants
    public static final String PROJECT_EVENTS_TOPIC = "project-events";
    public static final String USER_EVENTS_TOPIC = "user-events";
    public static final String ANALYTICS_EVENTS_TOPIC = "analytics-events";
    public static final String NOTIFICATION_EVENTS_TOPIC = "notification-events";

    /**
     * Publish project event to Kafka
     */
    public void publishProjectEvent(ProjectEvent event) {
        try {
            log.info("Publishing PROJECT event: {} with type: {}", event.getProjectId(), event.getEventType());
            String topic = PROJECT_EVENTS_TOPIC;
            
            Message<ProjectEvent> message = MessageBuilder
                .withPayload(event)
                .setHeader(KafkaHeaders.TOPIC, topic)
                .setHeader(KafkaHeaders.MESSAGE_KEY, event.getProjectId())
                .setHeader("event-type", event.getEventType())
                .setHeader("timestamp", event.getTimestamp().toString())
                .build();

            kafkaTemplate.send(message);
            log.info("PROJECT event published successfully");
        } catch (Exception e) {
            log.error("Error publishing PROJECT event: {}", event.getProjectId(), e);
            throw new RuntimeException("Failed to publish project event", e);
        }
    }

    /**
     * Publish user event to Kafka
     */
    public void publishUserEvent(UserEvent event) {
        try {
            log.info("Publishing USER event: {} with type: {}", event.getUserId(), event.getEventType());
            String topic = USER_EVENTS_TOPIC;
            
            Message<UserEvent> message = MessageBuilder
                .withPayload(event)
                .setHeader(KafkaHeaders.TOPIC, topic)
                .setHeader(KafkaHeaders.MESSAGE_KEY, event.getUserId())
                .setHeader("event-type", event.getEventType())
                .setHeader("timestamp", event.getTimestamp().toString())
                .build();

            kafkaTemplate.send(message);
            log.info("USER event published successfully");
        } catch (Exception e) {
            log.error("Error publishing USER event: {}", event.getUserId(), e);
            throw new RuntimeException("Failed to publish user event", e);
        }
    }

    /**
     * Publish analytics event to Kafka
     */
    public void publishAnalyticsEvent(AnalyticsEvent event) {
        try {
            log.info("Publishing ANALYTICS event: {}", event.getMetricName());
            String topic = ANALYTICS_EVENTS_TOPIC;
            
            Message<AnalyticsEvent> message = MessageBuilder
                .withPayload(event)
                .setHeader(KafkaHeaders.TOPIC, topic)
                .setHeader(KafkaHeaders.MESSAGE_KEY, event.getEventId())
                .setHeader("event-type", event.getEventType())
                .setHeader("timestamp", event.getTimestamp().toString())
                .build();

            kafkaTemplate.send(message);
            log.info("ANALYTICS event published successfully");
        } catch (Exception e) {
            log.error("Error publishing ANALYTICS event: {}", event.getMetricName(), e);
            throw new RuntimeException("Failed to publish analytics event", e);
        }
    }

    /**
     * Publish notification event to Kafka
     */
    public void publishNotificationEvent(NotificationEvent event) {
        try {
            log.info("Publishing NOTIFICATION event to: {}", event.getRecipientEmail());
            String topic = NOTIFICATION_EVENTS_TOPIC;
            
            Message<NotificationEvent> message = MessageBuilder
                .withPayload(event)
                .setHeader(KafkaHeaders.TOPIC, topic)
                .setHeader(KafkaHeaders.MESSAGE_KEY, event.getRecipientId())
                .setHeader("event-type", event.getEventType())
                .setHeader("timestamp", event.getTimestamp().toString())
                .setHeader("priority", event.getPriority())
                .build();

            kafkaTemplate.send(message);
            log.info("NOTIFICATION event published successfully");
        } catch (Exception e) {
            log.error("Error publishing NOTIFICATION event: {}", event.getRecipientEmail(), e);
            throw new RuntimeException("Failed to publish notification event", e);
        }
    }

    /**
     * Generic method to publish any event to a specific topic
     */
    public void publishEvent(String topic, String key, BaseEvent event) {
        try {
            log.info("Publishing event to topic: {}", topic);
            
            Message<BaseEvent> message = MessageBuilder
                .withPayload(event)
                .setHeader(KafkaHeaders.TOPIC, topic)
                .setHeader(KafkaHeaders.MESSAGE_KEY, key)
                .setHeader("event-type", event.getEventType())
                .setHeader("timestamp", event.getTimestamp().toString())
                .build();

            kafkaTemplate.send(message);
            log.info("Event published successfully to topic: {}", topic);
        } catch (Exception e) {
            log.error("Error publishing event to topic: {}", topic, e);
            throw new RuntimeException("Failed to publish event", e);
        }
    }
}
