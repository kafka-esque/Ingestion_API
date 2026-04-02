package api_toolkit.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Project DTO - Data transfer object for project information
 * Used for API requests and responses involving project data
 */
@Data
@NoArgsConstructor
public class ProjectDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;

    @NotBlank(message = "Project Identifier is required")
    @Size(min = 3, max = 50, message = "Project Identifier must be between 3 and 50 characters")
    private String projectIdentifier;

    @NotBlank(message = "Project Name is required")
    @Size(max = 100, message = "Project Name must not exceed 100 characters")
    private String projectName;

    @NotBlank(message = "Application Name is required")
    @Size(max = 100, message = "Application Name must not exceed 100 characters")
    private String applicationName;

    @NotBlank(message = "Partner Prism ID is required")
    private String partnerPrismId;

    @NotBlank(message = "Target Platform is required")
    private String targetPlatform;

    private String targetPlatformOther;

    @NotBlank(message = "Client Type is required")
    private String clientType;

    @NotBlank(message = "CSI Client Login Name is required")
    private String csiClientLoginName;

    private Boolean directInternetAccess = false;

    @Size(max = 1000, message = "Project Description must not exceed 1000 characters")
    private String projectDescription;

    @NotNull(message = "User ID is required")
    @Min(value = 1, message = "User ID must be greater than 0")
    private Long userId;

    private Long istServerId; // Optional IST server assignment
    
    // Audit fields for tracking changes
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long lastModifiedByUserId;
    private String lastModifiedByUsername;
    private String lastModifiedByRole;
}
