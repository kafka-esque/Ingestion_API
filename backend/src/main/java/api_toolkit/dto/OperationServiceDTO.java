package api_toolkit.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.io.Serializable;

/**
 * Operation Service DTO - Data transfer object for API operation/service information
 * Used for API requests and responses involving service data
 */
@Data
@NoArgsConstructor
public class OperationServiceDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;

    @NotBlank(message = "Service name is required")
    @Size(max = 100, message = "Service name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Domain ID is required")
    private Long domainId;

    @NotNull(message = "Version ID is required")
    private Long versionId;
}
