package api_toolkit.backend.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * User Event DTO for Kafka
 * 
 * Represents all user-related events (registered, updated, deleted)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEvent extends BaseEvent {

    private static final long serialVersionUID = 1L;

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("username")
    private String username;

    @JsonProperty("email")
    private String email;

    @JsonProperty("role")
    private String role;

    @JsonProperty("data")
    private Object data;

    public UserEvent(String eventType, String userId, String username, String email) {
        super(eventType, userId, "USER_SERVICE");
        this.userId = userId;
        this.username = username;
        this.email = email;
    }
}
