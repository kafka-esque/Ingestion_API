package api_toolkit.backend.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Base Event class for all Kafka events
 * 
 * All domain events should extend this class
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaseEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonProperty("event_id")
    private String eventId;

    @JsonProperty("event_type")
    private String eventType;

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;

    @JsonProperty("source")
    private String source;

    @JsonProperty("aggregate_id")
    private String aggregateId;

    @JsonProperty("version")
    private Integer version;

    public BaseEvent(String eventType, String aggregateId, String source) {
        this.eventId = java.util.UUID.randomUUID().toString();
        this.eventType = eventType;
        this.aggregateId = aggregateId;
        this.timestamp = LocalDateTime.now();
        this.source = source;
        this.version = 1;
    }
}
