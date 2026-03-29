package api_toolkit.backend.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Analytics Event DTO for Kafka
 * 
 * Represents analytics and metrics events
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsEvent extends BaseEvent {

    private static final long serialVersionUID = 1L;

    @JsonProperty("metric_name")
    private String metricName;

    @JsonProperty("metric_value")
    private Double metricValue;

    @JsonProperty("tags")
    private java.util.Map<String, String> tags;

    @JsonProperty("data")
    private Object data;

    public AnalyticsEvent(String eventType, String metricName, Double metricValue) {
        super(eventType, java.util.UUID.randomUUID().toString(), "ANALYTICS_SERVICE");
        this.metricName = metricName;
        this.metricValue = metricValue;
        this.tags = new java.util.HashMap<>();
    }
}
