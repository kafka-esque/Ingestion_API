package api_toolkit.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Global exception handler for centralized error management.
 * Beginner-friendly: Shows Spring Boot @ControllerAdvice pattern with proper HTTP status mapping.
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /** Handle resource not found exceptions (404) */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        log.error("Resource not found: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND);
    }

    /** Handle resource conflict exceptions (409) */
    @ExceptionHandler(ResourceConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ResourceConflictException ex) {
        log.warn("Resource conflict: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.CONFLICT);
    }

    /** Handle bad request exceptions (400) */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST);
    }

    /** Handle validation errors (400) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                    error -> error.getField(),
                    error -> error.getDefaultMessage(),
                    (existing, replacement) -> existing
                ));
        
        String message = "Validation failed: " + errors.toString();
        log.warn("Validation failed: {}", errors);
        
        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                message,
                getFullMessage(ex),
                ex.getClass().getSimpleName(),
                getStackTrace(ex)
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /** Handle access denied exceptions (403) */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return buildErrorResponse(ex, HttpStatus.FORBIDDEN);
    }

    /** Handle database constraint violations (409) */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String userMessage = parseConstraintViolation(ex);
        log.warn("Data integrity violation: {}", userMessage);
        
        ErrorResponse response = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                userMessage,
                getFullMessage(ex),
                ex.getClass().getSimpleName(),
                getStackTrace(ex)
        );
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    /** Handle all other exceptions (500) */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Internal server error: {}", ex.getMessage(), ex);
        
        ErrorResponse response = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal server error: " + (ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred"),
                getFullMessage(ex),
                ex.getClass().getSimpleName(),
                getStackTrace(ex)
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Helper methods

    /** Build standard error response */
    private ResponseEntity<ErrorResponse> buildErrorResponse(Exception ex, HttpStatus status) {
        ErrorResponse response = new ErrorResponse(
                status.value(),
                ex.getMessage(),
                getFullMessage(ex),
                ex.getClass().getSimpleName(),
                getStackTrace(ex)
        );
        return new ResponseEntity<>(response, status);
    }

    /** Get full exception message including root causes */
    private String getFullMessage(Exception ex) {
        StringBuilder message = new StringBuilder(ex.getMessage() != null ? ex.getMessage() : "No message");
        Throwable cause = ex.getCause();
        while (cause != null) {
            message.append(" | Caused by: ").append(cause.getMessage() != null ? cause.getMessage() : "Unknown");
            cause = cause.getCause();
        }
        return message.toString();
    }

    /** Convert stack trace to list of strings */
    private List<String> getStackTrace(Exception ex) {
        return Arrays.stream(ex.getStackTrace())
                .map(StackTraceElement::toString)
                .collect(Collectors.toList());
    }

    /** Parse database constraint violations into user-friendly messages */
    private String parseConstraintViolation(DataIntegrityViolationException ex) {
        String message = ex.getMessage();
        String rootMessage = ex.getRootCause() != null ? ex.getRootCause().getMessage() : "";
        String fullMessage = (message + " " + rootMessage).toLowerCase();

        if (fullMessage.contains("duplicate entry")) {
            if (fullMessage.contains("project_identifier")) {
                return "A project with this identifier already exists. Please choose a different identifier.";
            }
            if (fullMessage.contains("email")) {
                return "A contact with this email already exists. Please use a different email address.";
            }
            return "This value already exists. Please choose a different value.";
        }
        if (fullMessage.contains("foreign key constraint")) {
            return "Invalid reference to related data. Please check your input.";
        }
        if (fullMessage.contains("cannot be null")) {
            return "Required field is missing. Please provide all required information.";
        }
        if (fullMessage.contains("check constraint")) {
            return "Data does not meet required constraints. Please check your input.";
        }
        return "Database constraint violation occurred. Please check your input.";
    }
}
