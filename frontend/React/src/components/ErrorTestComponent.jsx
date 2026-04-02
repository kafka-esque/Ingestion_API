import React, { useState } from "react";
import { useError } from "../context/ErrorContext";
import { useAuth } from "../context/AuthContext";

/**
 * Test component to demonstrate enhanced error handling integration with role-based access
 * This shows how different user roles see different levels of error detail
 */
const ErrorTestComponent = () => {
    const { handleError } = useError();
    const { user } = useAuth();

    // For testing purposes, allow manual role switching
    const [testRole, setTestRole] = useState(user?.role || "user");

    // Available roles for testing
    const roles = {
        USER: "user",
        ADMIN: "admin",
        SUPER_ADMIN: "super_admin",
    };

    const isAdmin = () => {
        return testRole === "admin" || testRole === "super_admin";
    };

    // Test different error scenarios
    const testErrors = [
        {
            name: "Resource Not Found",
            endpoint: "/api/test-errors/not-found",
            description: "Test 404 error with detailed information",
        },
        {
            name: "Server Conflict",
            endpoint: "/api/test-errors/conflict",
            description: "Test 409 conflict error",
        },
        {
            name: "Bad Request",
            endpoint: "/api/test-errors/illegal-argument",
            description: "Test 400 bad request error",
        },
        {
            name: "Null Pointer Exception",
            endpoint: "/api/test-errors/null-pointer",
            description: "Test 500 runtime error with stack trace (admin only)",
        },
        {
            name: "Array Index Error",
            endpoint: "/api/test-errors/array-index",
            description: "Test ArrayIndexOutOfBoundsException (admin only)",
        },
        {
            name: "Arithmetic Error",
            endpoint: "/api/test-errors/arithmetic",
            description:
                "Test ArithmeticException - division by zero (admin only)",
        },
    ];

    const triggerError = async (endpoint) => {
        try {
            const response = await fetch(`http://localhost:8080${endpoint}`);
            if (!response.ok) {
                const errorData = await response.json();

                // Create an error object that matches what axios would provide
                const error = {
                    response: {
                        status: response.status,
                        data: errorData,
                    },
                };

                // Use the error handler
                handleError(error);
            } else {
                const data = await response.text();
                console.log("Success:", data);
            }
        } catch (error) {
            console.error("Network error:", error);
            handleError(error);
        }
    };

    const handleRoleSwitch = (newRole) => {
        setTestRole(newRole);
    };

    return (
        <div className='p-6 max-w-4xl mx-auto'>
            <h2 className='text-2xl font-bold mb-4 text-gray-800'>
                🧪 Role-Based Error Testing
            </h2>
            <p className='text-gray-600 mb-6'>
                Click the buttons below to test different error scenarios and
                see how the enhanced error handling displays different levels of
                detail based on user role.
            </p>

            {/* Role Switcher */}
            <div className='mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg'>
                <h3 className='font-semibold text-lg mb-3 text-gray-800'>
                    👤 Current Role:{" "}
                    <span
                        className={`px-3 py-1 rounded-full text-sm ${
                            isAdmin()
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                        }`}
                    >
                        {testRole.toUpperCase()}
                    </span>
                </h3>
                <div className='space-x-3'>
                    <button
                        onClick={() => handleRoleSwitch(roles.USER)}
                        className={`px-4 py-2 rounded transition-colors ${
                            testRole === roles.USER
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        👥 User
                    </button>
                    <button
                        onClick={() => handleRoleSwitch(roles.ADMIN)}
                        className={`px-4 py-2 rounded transition-colors ${
                            testRole === roles.ADMIN
                                ? "bg-red-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        🔧 Admin
                    </button>
                </div>
                <p className='text-sm text-gray-600 mt-2'>
                    {isAdmin()
                        ? "🔍 As an admin, you'll see stack traces and technical details"
                        : "👁️ As a user, you'll see user-friendly messages only"}
                </p>
                <p className='text-xs text-yellow-600 mt-1'>
                    ⚠️ Note: This is a test role switcher. In production, roles
                    come from your actual user authentication.
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {testErrors.map((test, index) => (
                    <div
                        key={index}
                        className='border rounded-lg p-4 hover:shadow-md transition-shadow'
                    >
                        <h3 className='font-semibold text-lg mb-2'>
                            {test.name}
                        </h3>
                        <p className='text-sm text-gray-600 mb-3'>
                            {test.description}
                        </p>
                        <button
                            onClick={() => triggerError(test.endpoint)}
                            className='w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors'
                        >
                            Trigger Error
                        </button>
                        <p className='text-xs text-gray-500 mt-2'>
                            {test.endpoint}
                        </p>
                    </div>
                ))}
            </div>

            <div className='mt-8 p-4 bg-blue-50 rounded-lg'>
                <h3 className='font-semibold text-blue-800 mb-2'>
                    💡 How to Use
                </h3>
                <ul className='text-sm text-blue-700 space-y-1'>
                    <li>
                        • Switch between User and Admin roles using the buttons
                        above
                    </li>
                    <li>
                        • Click any error button to trigger an error from the
                        backend
                    </li>
                    <li>
                        • Error notifications will appear in the top-right
                        corner
                    </li>
                    <li>
                        • Click "Technical Details" to expand error information
                    </li>
                    <li>
                        • Admins see stack traces, users see only user-friendly
                        messages
                    </li>
                    <li>• Check the browser console for detailed error logs</li>
                </ul>
            </div>

            <div className='mt-6 p-4 bg-yellow-50 rounded-lg'>
                <h3 className='font-semibold text-yellow-800 mb-2'>
                    🔍 What You'll See
                </h3>
                <div className='grid md:grid-cols-2 gap-4'>
                    <div>
                        <h4 className='font-medium text-yellow-800 mb-2'>
                            👥 Regular Users:
                        </h4>
                        <ul className='text-sm text-yellow-700 space-y-1'>
                            <li>• User-friendly error messages</li>
                            <li>• Status codes and exception types</li>
                            <li>• Technical message (safe details)</li>
                            <li>• Timestamp information</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className='font-medium text-yellow-800 mb-2'>
                            🔧 Administrators:
                        </h4>
                        <ul className='text-sm text-yellow-700 space-y-1'>
                            <li>• Everything users see, plus:</li>
                            <li>• Full Java stack traces</li>
                            <li>• Complete technical details</li>
                            <li>• "Admin View" badge indicator</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className='mt-6 p-4 bg-green-50 rounded-lg'>
                <h3 className='font-semibold text-green-800 mb-2'>
                    🛡️ Security Features
                </h3>
                <ul className='text-sm text-green-700 space-y-1'>
                    <li>• Stack traces hidden from regular users</li>
                    <li>• Role-based error detail filtering</li>
                    <li>
                        • Development environment automatically shows full
                        details
                    </li>
                    <li>• Production-ready security by default</li>
                </ul>
            </div>
        </div>
    );
};

export default ErrorTestComponent;
