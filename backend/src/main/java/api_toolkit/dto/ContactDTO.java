package api_toolkit.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.io.Serializable;

/**
 * Contact DTO - Data transfer object for contact information
 * Used for API requests and responses involving contact data
 */
@Data
@NoArgsConstructor
public class ContactDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;

    @NotBlank(message = "Email name is required")
    @Size(max = 100, message = "Email name must not exceed 100 characters")
    private String emailName;

    @NotBlank(message = "Email ID is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String emailId;

    @NotBlank(message = "Contact type is required")
    @Size(max = 50, message = "Contact type must not exceed 50 characters")
    private String contactType;
}
