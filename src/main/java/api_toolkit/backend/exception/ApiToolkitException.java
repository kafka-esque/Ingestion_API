package api_toolkit.backend.exception;

/**
 * Custom RuntimeException for API Toolkit
 * 
 * Used throughout the application for consistent error handling
 */
public class ApiToolkitException extends RuntimeException {
    
    private String errorCode;
    private int statusCode;

    public ApiToolkitException(String message) {
        super(message);
        this.statusCode = 500;
    }

    public ApiToolkitException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = 400;
    }

    public ApiToolkitException(String message, String errorCode, int statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }

    public ApiToolkitException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = 500;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
