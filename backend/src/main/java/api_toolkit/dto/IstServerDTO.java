package api_toolkit.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.io.Serializable;

/**
 * IST Server DTO - Data transfer object for test server information
 * Used for API requests and responses involving server data
 */
@Data
@NoArgsConstructor
public class IstServerDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;

    @NotBlank(message = "Server name is required")
    @Size(max = 100, message = "Server name must not exceed 100 characters")
    private String name;
}
