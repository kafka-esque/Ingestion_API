// Error types for the application
export const ErrorTypes = {
    NOT_FOUND: "NOT_FOUND",
    CONFLICT: "CONFLICT",
    VALIDATION: "VALIDATION",
    SERVER_ERROR: "SERVER_ERROR",
    NETWORK_ERROR: "NETWORK_ERROR",
};

// Enhanced error structure to match backend response
export const createErrorFromResponse = (error, userRole = "user") => {
    const resp = error.response?.data;
    const status = error.response?.status;
    const isAdmin = userRole === "admin" || userRole === "ADMIN";
    const isDevelopment = process.env.NODE_ENV === "development";

    // Show stack traces to admins or in development environment
    const showStackTrace = isAdmin || isDevelopment;

    // If response has our enhanced error format
    if (resp && typeof resp === "object" && resp.status && resp.message) {
        return {
            type: getErrorTypeFromStatus(status),
            message: resp.message,
            technicalMessage: resp.technicalMessage || resp.message,
            exceptionType: resp.exceptionType || "Unknown",
            timestamp: resp.timestamp || new Date().toISOString(),
            stackTrace: showStackTrace ? resp.stackTrace || [] : [],
            status: resp.status,
            userRole: userRole,
            hasDetails: !!(
                resp.technicalMessage ||
                resp.exceptionType ||
                (showStackTrace && resp.stackTrace)
            ),
            showStackTrace: showStackTrace,
        };
    }

    // Fallback for simple error responses
    return {
        type: getErrorTypeFromStatus(status),
        message: getDefaultMessage(status, resp),
        technicalMessage: resp?.message || error.message || "Unknown error",
        exceptionType: "Unknown",
        timestamp: new Date().toISOString(),
        stackTrace: [],
        status: status || 0,
        userRole: userRole,
        hasDetails: false,
        showStackTrace: false,
    };
};

// Helper function to determine error type from status code
const getErrorTypeFromStatus = (status) => {
    switch (status) {
        case 404:
            return ErrorTypes.NOT_FOUND;
        case 409:
            return ErrorTypes.CONFLICT;
        case 400:
            return ErrorTypes.VALIDATION;
        case 500:
            return ErrorTypes.SERVER_ERROR;
        default:
            return ErrorTypes.NETWORK_ERROR;
    }
};

// Helper function to get default message
const getDefaultMessage = (status, resp) => {
    if (typeof resp === "string") return resp;
    if (resp?.message) return resp.message;

    switch (status) {
        case 404:
            return "Resource not found";
        case 409:
            return "Conflict occurred";
        case 400:
            return typeof resp === "object"
                ? Object.values(resp).join(", ")
                : "Validation error";
        case 500:
            return "Internal server error";
        default:
            return "Network error";
    }
};
