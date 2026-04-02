package api_toolkit.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.io.Serializable;

/**
 * Domain Version DTO - Data transfer object for API domain version information
 * Used for API requests and responses involving version data
 */
@Data
@NoArgsConstructor
public class DomainVersionDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;

    @NotBlank(message = "Version is required")
    @Size(max = 50, message = "Version must not exceed 50 characters")
    private String version;

    @NotNull(message = "Domain ID is required")
    private Long domainId;
}
