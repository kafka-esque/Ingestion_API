import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useError } from "../context/ErrorContext";
import { apiClient } from "../utils/appConfig";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { handleError } = useError();
    const [successMessage, setSuccessMessage] = useState("");
    const [debugInfo, setDebugInfo] = useState(""); // For debugging

    const location = useLocation();
    const reqEmail = location?.state?.email || "";
    const [email, setEmail] = useState(reqEmail);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log("🔐 Attempting forgot password for:", email);
            setDebugInfo("Sending request to server...");

            // Show progress message after a few seconds
            const progressTimer = setTimeout(() => {
                setDebugInfo("Sending email... This may take a few moments.");
            }, 3000);

            const response = await apiClient.post("/api/auth/forgot-password", {
                email,
            });

            // Clear the progress timer
            clearTimeout(progressTimer);

            console.log("📧 Forgot password response:", response);
            setDebugInfo(`Server responded with status: ${response.status}`);

            // Handle successful response (200 status)
            if (response.status === 200) {
                const message = response.data || "";
                console.log("✅ Success message:", message);
                setDebugInfo(`Success: ${message}`);

                // For 200 status, we assume email was sent successfully
                // regardless of the exact message content
                setSuccessMessage("Reset link sent to your email!");
                setTimeout(() => {
                    window.open(
                        "https://mail.google.com",
                        "_blank",
                        "noopener,noreferrer"
                    );
                }, 2000);
            } else {
                console.log("⚠️ Unexpected response:", response);
                setDebugInfo(`Unexpected response status: ${response.status}`);
                handleError(new Error("Unexpected response from server"));
            }
        } catch (error) {
            console.error("❌ Forgot password error:", error);
            setDebugInfo(
                `Error: ${error.message} | Type: ${error.constructor.name}`
            );

            // Check if it's a network error or server error
            if (error.response) {
                // Server responded with error status
                const status = error.response.status;
                const message = error.response.data || "Unknown server error";

                console.log(`🔍 Server error ${status}:`, message);

                if (status === 404) {
                    handleError(
                        new Error("No account found with this email address.")
                    );
                } else if (status === 500) {
                    // Check if it's an email sending error but email was actually sent
                    if (
                        typeof message === "string" &&
                        (message.includes("sent") ||
                            message.includes("success"))
                    ) {
                        console.log("✅ Email sent despite server error");
                        setSuccessMessage("Reset link sent to your email!");
                        setTimeout(() => {
                            window.open(
                                "https://mail.google.com",
                                "_blank",
                                "noopener,noreferrer"
                            );
                        }, 2000);
                    } else {
                        handleError(
                            new Error(
                                "There was an issue sending the email. Please try again or contact support."
                            )
                        );
                    }
                } else {
                    handleError(
                        new Error(
                            "Please check your email address and try again."
                        )
                    );
                }
            } else if (error.request) {
                // Network error or timeout
                console.log("🌐 Network error:", error.request);
                setDebugInfo(
                    `Network error details: ${JSON.stringify(error.request)}`
                ); // Capture request details for debugging
                if (
                    error.code === "ECONNABORTED" ||
                    error.message.includes("timeout")
                ) {
                    handleError(
                        new Error(
                            "Request timed out. Please check your internet connection and try again."
                        )
                    );
                } else {
                    handleError(
                        new Error(
                            "Unable to connect to server. Please check your internet connection and try again."
                        )
                    );
                }
            } else {
                // Other error
                console.log("🔧 Other error:", error.message);
                handleError(
                    new Error("An unexpected error occurred. Please try again.")
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-black'>
            <div className='bg-white/10 backdrop-blur-lg border border-white/20 w-full max-w-md p-8 rounded-2xl shadow-lg'>
                <div className='text-center space-y-3'>
                    <h1 className='text-3xl font-semibold text-white drop-shadow-md'>
                        Forgot Password?
                    </h1>
                    <p className='text-gray-300'>
                        Enter your email below and we'll send you a reset link.
                    </p>
                </div>

                {/* Success message display */}
                {successMessage && (
                    <div
                        className='p-4 rounded-lg shadow-lg border-l-4 bg-green-50 border-green-400 text-green-800 mt-4'
                        role='alert'
                    >
                        <div className='flex items-start'>
                            <span className='mr-2 text-lg'>✅</span>
                            <div className='flex-1'>
                                <p className='text-sm font-medium'>
                                    {successMessage}
                                </p>
                            </div>
                            <button
                                type='button'
                                className='ml-2 text-green-400 hover:text-green-600 focus:outline-none'
                                onClick={() => setSuccessMessage("")}
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
                )}

                {/* Debug info display (for troubleshooting) */}
                {debugInfo && process.env.NODE_ENV === "development" && (
                    <div className='p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 mt-4 text-xs'>
                        <strong>Debug:</strong> {debugInfo}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className='mt-6 space-y-5'
                >
                    <div className='space-y-2'>
                        <label
                            htmlFor='email'
                            className='text-sm font-medium text-gray-200'
                        >
                            Email Address
                        </label>
                        <input
                            type='email'
                            id='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full px-4 py-3 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300 transition duration-200'
                            placeholder='Enter your email'
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition duration-300 flex items-center justify-center 
                            ${
                                isLoading
                                    ? "bg-gray-600 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {isLoading ? (
                            <span className='flex items-center'>
                                <svg
                                    className='animate-spin h-5 w-5 mr-3 text-white'
                                    viewBox='0 0 24 24'
                                >
                                    <circle
                                        className='opacity-25'
                                        cx='12'
                                        cy='12'
                                        r='10'
                                        stroke='currentColor'
                                        strokeWidth='4'
                                        fill='none'
                                    />
                                    <path
                                        className='opacity-75'
                                        fill='currentColor'
                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                                    />
                                </svg>
                                Sending Email...
                            </span>
                        ) : (
                            "Send Reset Link"
                        )}
                    </button>
                </form>

                <div className='text-center mt-4'>
                    <button
                        onClick={() => navigate("/login")}
                        className='text-sm text-blue-400 hover:text-blue-500 hover:underline transition duration-200'
                    >
                        Back to Login
                    </button>
                </div>

                {/* Debug info display - only for development, can be removed later */}
                {import.meta.env.MODE === "development" && debugInfo && (
                    <div className='mt-4 p-4 rounded-lg bg-gray-800 text-gray-100 text-sm'>
                        <strong>Debug Info:</strong>
                        <pre className='whitespace-pre-wrap'>{debugInfo}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
