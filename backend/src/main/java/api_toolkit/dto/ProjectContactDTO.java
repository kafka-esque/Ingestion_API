package api_toolkit.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.io.Serializable;

/**
 * Project Contact DTO - Data transfer object for project-contact mappings
 * Used for linking projects with contacts
 */
@Data
@NoArgsConstructor
public class ProjectContactDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Contact ID is required")
    private Long contactId;
}
