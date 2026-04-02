package api_toolkit.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.io.Serializable;

/**
 * Domain DTO - Data transfer object for API domain information
 * Used for API requests and responses involving domain data
 */
@Data
@NoArgsConstructor
public class DomainDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;

    @NotBlank(message = "Domain name is required")
    @Size(max = 100, message = "Domain name must not exceed 100 characters")
    private String name;
}
