package api_toolkit.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.io.Serializable;

/**
 * Project Operation DTO - Data transfer object for project-operation mappings
 * Used for linking projects with operation services
 */
@Data
@NoArgsConstructor
public class ProjectOperationDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Service ID is required")
    private Long serviceId;
}
