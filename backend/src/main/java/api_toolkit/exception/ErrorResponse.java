package api_toolkit.exception;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Standard error response for REST API exceptions.
 * Beginner-friendly: Shows how to structure error responses in Spring Boot.
 */
@Data
@NoArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private String technicalMessage;
    private String exceptionType;
    private LocalDateTime timestamp = LocalDateTime.now();
    private List<String> stackTrace;

    /** Simple error for basic validation failures */
    public ErrorResponse(int status, String message) {
        this(status, message, null, null, null);
    }

    /** Detailed error with technical info for debugging */
    public ErrorResponse(int status, String message, String technicalMessage, String exceptionType) {
        this(status, message, technicalMessage, exceptionType, null);
    }

    /** Full error with stack trace for admin users */
    public ErrorResponse(int status, String message, String technicalMessage, String exceptionType, List<String> stackTrace) {
        this.status = status;
        this.message = message;
        this.technicalMessage = technicalMessage;
        this.exceptionType = exceptionType;
        this.stackTrace = stackTrace;
        this.timestamp = LocalDateTime.now();
    }
}
