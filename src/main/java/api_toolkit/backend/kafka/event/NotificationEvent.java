package api_toolkit.backend.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Notification Event DTO for Kafka
 * 
 * Represents notification events (email, in-app, SMS)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent extends BaseEvent {

    private static final long serialVersionUID = 1L;

    @JsonProperty("recipient_id")
    private String recipientId;

    @JsonProperty("recipient_email")
    private String recipientEmail;

    @JsonProperty("notification_type")
    private String notificationType;

    @JsonProperty("subject")
    private String subject;

    @JsonProperty("message")
    private String message;

    @JsonProperty("priority")
    private String priority;

    public NotificationEvent(String eventType, String recipientId, String recipientEmail, 
                           String notificationType, String subject, String message) {
        super(eventType, java.util.UUID.randomUUID().toString(), "NOTIFICATION_SERVICE");
        this.recipientId = recipientId;
        this.recipientEmail = recipientEmail;
        this.notificationType = notificationType;
        this.subject = subject;
        this.message = message;
        this.priority = "NORMAL";
    }
}
