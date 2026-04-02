package api_toolkit.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception for resource conflicts (duplicate emails, existing relationships).
 * Beginner-friendly: Shows HTTP 409 Conflict handling in Spring Boot.
 */
@ResponseStatus(HttpStatus.CONFLICT)  // 409 Conflict
public class ResourceConflictException extends RuntimeException {

    /** Standard constructor for conflict scenarios */
    public ResourceConflictException(String message) {
        super(message);
    }
    
    /** Convenience constructor for duplicate resource conflicts */
    public ResourceConflictException(String resourceType, String identifier) {
        super(String.format("%s '%s' already exists", resourceType, identifier));
    }
}
