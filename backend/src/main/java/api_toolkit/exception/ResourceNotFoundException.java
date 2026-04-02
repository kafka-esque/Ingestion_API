package api_toolkit.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception for missing resources (users, projects, etc.).
 * Beginner-friendly: Shows Spring Boot custom exception pattern.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    
    /** Standard constructor for resource not found scenarios */
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    /** Convenience constructor with resource type and ID */
    public ResourceNotFoundException(String resourceType, Long id) {
        super(String.format("%s with ID %d not found", resourceType, id));
    }
}
