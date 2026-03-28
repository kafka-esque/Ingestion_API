package api_toolkit.backend.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Project Event DTO for Kafka
 * 
 * Represents all project-related events (created, updated, deleted)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectEvent extends BaseEvent {

    private static final long serialVersionUID = 1L;

    @JsonProperty("project_id")
    private String projectId;

    @JsonProperty("project_name")
    private String projectName;

    @JsonProperty("owner_id")
    private String ownerId;

    @JsonProperty("description")
    private String description;

    @JsonProperty("status")
    private String status;

    @JsonProperty("data")
    private Object data;

    public ProjectEvent(String eventType, String projectId, String projectName, String ownerId) {
        super(eventType, projectId, "PROJECT_SERVICE");
        this.projectId = projectId;
        this.projectName = projectName;
        this.ownerId = ownerId;
    }
}
