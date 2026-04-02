import React, { createContext, useState, useContext, useCallback } from "react";
import { ErrorTypes, createErrorFromResponse } from "../types/errors";
import { useAuth } from "./AuthContext";

const ErrorContext = createContext();

// Helper function to check if user should see admin features
const isAdminUser = (userRole) => {
    return (
        userRole === "admin" ||
        userRole === "ADMIN" ||
        process.env.NODE_ENV === "development"
    );
};

// Provider that captures and displays global errors
export const ErrorProvider = ({ children }) => {
    const [errors, setErrors] = useState([]);
    const [expandedErrors, setExpandedErrors] = useState(new Set());
    const { user } = useAuth();

    // Get user role from auth context
    const userRole = user?.role || "user";

    // Central error handler: call this from any component when an API call fails
    const handleError = useCallback(
        (error) => {
            // Ensure we have the latest user role
            const currentUserRole = user?.role || userRole || "user";
            const enhancedError = createErrorFromResponse(
                error,
                currentUserRole
            );

            // Debug log for development
            console.group("🔥 Error Details");
            console.log("Status:", enhancedError.status);
            console.log("Type:", enhancedError.type);
            console.log("User Role:", enhancedError.userRole);
            console.log("Current User Role:", currentUserRole);
            console.log("Show Stack Trace:", enhancedError.showStackTrace);
            console.log("User Message:", enhancedError.message);
            console.log("Technical Message:", enhancedError.technicalMessage);
            console.log("Exception Type:", enhancedError.exceptionType);
            console.log("Timestamp:", enhancedError.timestamp);
            if (
                enhancedError.showStackTrace &&
                enhancedError.stackTrace.length > 0
            ) {
                console.log("Stack Trace:", enhancedError.stackTrace);
            }
            console.log("Raw Response:", error.response?.data);
            console.groupEnd();

            // Add unique ID for error management
            const errorWithId = {
                ...enhancedError,
                id: Date.now() + Math.random(),
            };

            // Prepend new error to list
            setErrors((prev) => [errorWithId, ...prev]);
        },
        [userRole, user]
    );

    // Toggle error details expansion
    const toggleErrorDetails = useCallback((errorId) => {
        setExpandedErrors((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(errorId)) {
                newSet.delete(errorId);
            } else {
                newSet.add(errorId);
            }
            return newSet;
        });
    }, []);

    // Remove specific error
    const removeError = useCallback((errorId) => {
        setErrors((prev) => prev.filter((err) => err.id !== errorId));
        setExpandedErrors((prev) => {
            const newSet = new Set(prev);
            newSet.delete(errorId);
            return newSet;
        });
    }, []);

    // Clear all errors
    const clearErrors = useCallback(() => {
        setErrors([]);
        setExpandedErrors(new Set());
    }, []);

    return (
        <ErrorContext.Provider
            value={{
                errors,
                handleError,
                clearErrors,
                removeError,
                toggleErrorDetails,
            }}
        >
            {/* Render alerts for each error */}
            <div className='fixed top-4 right-4 z-50 space-y-2 max-w-md'>
                {errors.map((err) => {
                    const isExpanded = expandedErrors.has(err.id);
                    return (
                        <div
                            key={err.id}
                            className={`p-4 rounded-lg shadow-lg border-l-4 ${getAlertStyles(
                                err.type
                            )} transition-all duration-300 ease-in-out ${
                                isExpanded ? "max-w-lg" : "max-w-md"
                            }`}
                            role='alert'
                        >
                            <div className='flex items-start'>
                                <span className='mr-2 text-lg flex-shrink-0'>
                                    {getErrorIcon(err.type)}
                                </span>
                                <div className='flex-1 min-w-0'>
                                    {/* Main error message */}
                                    <p className='text-sm font-medium mb-1'>
                                        {err.message}
                                    </p>

                                    {/* Error metadata */}
                                    <div className='flex items-center text-xs text-gray-600 mb-2'>
                                        <span className='bg-gray-200 px-2 py-1 rounded mr-2'>
                                            {err.status}
                                        </span>
                                        <span className='bg-gray-200 px-2 py-1 rounded mr-2'>
                                            {err.exceptionType}
                                        </span>
                                        <span className='text-gray-500'>
                                            {new Date(
                                                err.timestamp
                                            ).toLocaleTimeString()}
                                        </span>
                                    </div>

                                    {/* Expandable technical details */}
                                    {err.hasDetails && (
                                        <div>
                                            <button
                                                onClick={() =>
                                                    toggleErrorDetails(err.id)
                                                }
                                                className='text-xs text-blue-600 hover:text-blue-800 mb-2 flex items-center'
                                            >
                                                {isExpanded ? "▼" : "▶"}
                                                <span className='ml-1'>
                                                    Technical Details
                                                </span>
                                            </button>

                                            {isExpanded && (
                                                <div className='bg-gray-100 p-3 rounded text-xs space-y-2 max-h-60 overflow-y-auto'>
                                                    {/* User Role Badge (for admins) */}
                                                    {isAdminUser(userRole) && (
                                                        <div className='mb-2'>
                                                            <span className='bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold'>
                                                                🔧 Admin View
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Technical message */}
                                                    <div>
                                                        <strong className='text-gray-700'>
                                                            Technical Message:
                                                        </strong>
                                                        <p className='text-gray-600 break-words'>
                                                            {
                                                                err.technicalMessage
                                                            }
                                                        </p>
                                                    </div>

                                                    {/* Stack trace (admin only) */}
                                                    {isAdminUser(userRole) &&
                                                        err.stackTrace &&
                                                        err.stackTrace.length >
                                                            0 && (
                                                            <div>
                                                                <strong className='text-gray-700'>
                                                                    Stack Trace:
                                                                </strong>
                                                                <div className='bg-gray-800 text-green-400 p-2 rounded text-xs font-mono max-h-32 overflow-y-auto'>
                                                                    {err.stackTrace
                                                                        .slice(
                                                                            0,
                                                                            10
                                                                        )
                                                                        .map(
                                                                            (
                                                                                trace,
                                                                                idx
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        idx
                                                                                    }
                                                                                    className='break-all'
                                                                                >
                                                                                    {
                                                                                        trace
                                                                                    }
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    {err
                                                                        .stackTrace
                                                                        .length >
                                                                        10 && (
                                                                        <div className='text-yellow-400'>
                                                                            ...
                                                                            and{" "}
                                                                            {err
                                                                                .stackTrace
                                                                                .length -
                                                                                10}{" "}
                                                                            more
                                                                            lines
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Close button */}
                                <button
                                    type='button'
                                    className='ml-2 text-gray-400 hover:text-gray-600 focus:outline-none flex-shrink-0'
                                    onClick={() => removeError(err.id)}
                                >
                                    <svg
                                        className='w-4 h-4'
                                        fill='currentColor'
                                        viewBox='0 0 20 20'
                                    >
                                        <path
                                            fillRule='evenodd'
                                            d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                                            clipRule='evenodd'
                                        ></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            {children}
        </ErrorContext.Provider>
    );
};

// Determine alert styles based on error type
const getAlertStyles = (type) => {
    switch (type) {
        case ErrorTypes.NOT_FOUND:
            return "bg-yellow-50 border-yellow-400 text-yellow-800";
        case ErrorTypes.CONFLICT:
            return "bg-red-50 border-red-400 text-red-800";
        case ErrorTypes.VALIDATION:
            return "bg-blue-50 border-blue-400 text-blue-800";
        case ErrorTypes.SERVER_ERROR:
            return "bg-red-50 border-red-500 text-red-900";
        default:
            return "bg-gray-50 border-gray-400 text-gray-800";
    }
};

// Choose an icon for each error type
const getErrorIcon = (type) => {
    switch (type) {
        case ErrorTypes.NOT_FOUND:
            return "⚠️";
        case ErrorTypes.CONFLICT:
            return "❌";
        case ErrorTypes.VALIDATION:
            return "ℹ️";
        case ErrorTypes.SERVER_ERROR:
            return "🔥";
        default:
            return "⚡";
    }
};

// Custom hook to use the ErrorContext
export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) throw new Error("useError must be used within ErrorProvider");
    return context;
};
