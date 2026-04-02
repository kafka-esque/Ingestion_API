package api_toolkit.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.io.Serializable;

/**
 * Profile Update DTO - Data transfer object for user profile updates
 * Used for updating user information and password changes
 */
@Data
@NoArgsConstructor
public class ProfileUpdateDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    // Password change fields (optional)
    private String currentPassword;
    
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password; // new password

    private String role;
}
