package api_toolkit.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.io.Serializable;

/**
 * User DTO - Data transfer object for user information
 * Used for API requests and responses involving user data
 */
@Data
@NoArgsConstructor
public class UserDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;

    @NotNull(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotNull(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    private String role;
}