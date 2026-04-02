import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useError } from "../context/ErrorContext";
import { apiClient } from "../utils/appConfig";

const ResetPassword = () => {
    const { token } = useParams(); // Get token from URL params
    const navigate = useNavigate();
    const { handleError } = useError();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        console.log("ResetPassword - Token from URL:", token);
        console.log("ResetPassword - Token length:", token ? token.length : 0);

        // Check if token exists and has proper JWT structure
        if (!token) {
            console.error("ResetPassword - No token found in URL");
            handleError(new Error("Invalid or missing reset token"));
            setTokenValid(false);
            setTimeout(() => navigate("/forgot-password"), 3000);
            return;
        }

        // Validate JWT structure (should have 3 parts separated by dots)
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
            console.error(
                "ResetPassword - Invalid token structure:",
                tokenParts.length,
                "parts"
            );
            handleError(new Error("Invalid reset token format"));
            setTokenValid(false);
            setTimeout(() => navigate("/forgot-password"), 3000);
            return;
        }

        // Try to decode and validate the token
        try {
            const base64Url = tokenParts[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(function (c) {
                        return (
                            "%" +
                            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                        );
                    })
                    .join("")
            );
            const decodedToken = JSON.parse(jsonPayload);

            console.log("ResetPassword - Decoded token:", {
                sub: decodedToken.sub,
                exp: decodedToken.exp,
                iat: decodedToken.iat,
            });

            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (decodedToken.exp && decodedToken.exp < currentTime) {
                console.error("ResetPassword - Token expired");
                handleError(
                    new Error(
                        "Reset token has expired. Please request a new password reset."
                    )
                );
                setTokenValid(false);
                setTimeout(() => navigate("/forgot-password"), 3000);
                return;
            }

            console.log("ResetPassword - Token is valid and not expired");
        } catch (error) {
            console.error("ResetPassword - Token decode error:", error);
            handleError(
                new Error(
                    "Invalid reset token. Please request a new password reset."
                )
            );
            setTokenValid(false);
            setTimeout(() => navigate("/forgot-password"), 3000);
        }
    }, [token, navigate, handleError]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (password !== confirmPassword) {
            handleError(new Error("Passwords do not match"));
            return;
        }

        if (password.length < 6) {
            handleError(
                new Error("Password must be at least 6 characters long")
            );
            return;
        }

        setIsLoading(true);

        try {
            // Call the backend reset password endpoint
            const response = await apiClient.post(
                `/api/auth/reset-password/${token}`,
                { password }
            );

            if (response.status === 200 && response.data) {
                const message = response.data;
                if (message.includes("success") || message.includes("reset")) {
                    setSuccessMessage("Password reset successfully!");
                    setTimeout(() => {
                        navigate("/login");
                    }, 2000);
                } else {
                    handleError(new Error(message));
                }
            }
        } catch (error) {
            console.error("Reset password error:", error);

            // Handle specific error cases
            if (
                error.response?.status === 400 ||
                error.response?.status === 401
            ) {
                setTokenValid(false);
                setTimeout(() => navigate("/forgot-password"), 3000);
            }

            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-black'>
                <div className='bg-white/10 backdrop-blur-lg border border-white/20 w-full max-w-md p-8 rounded-2xl shadow-lg text-center'>
                    <h1 className='text-3xl font-semibold text-white drop-shadow-md mb-4'>
                        Invalid Token
                    </h1>
                    <p className='text-gray-300 mb-6'>
                        The reset token is invalid or has expired. You will be
                        redirected to request a new one.
                    </p>
                    <div className='animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto'></div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-black'>
            <div className='bg-white/10 backdrop-blur-lg border border-white/20 w-full max-w-md p-8 rounded-2xl shadow-lg'>
                <div className='text-center space-y-3'>
                    <h1 className='text-3xl font-semibold text-white drop-shadow-md'>
                        Reset Password
                    </h1>
                    <p className='text-gray-300'>
                        Enter your new password below.
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

                <form
                    onSubmit={handleSubmit}
                    className='mt-6 space-y-5'
                >
                    <div className='space-y-2'>
                        <label
                            htmlFor='password'
                            className='text-sm font-medium text-gray-200'
                        >
                            New Password
                        </label>
                        <input
                            type='password'
                            id='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full px-4 py-3 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300 transition duration-200'
                            placeholder='Enter new password'
                            required
                            minLength={6}
                        />
                    </div>

                    <div className='space-y-2'>
                        <label
                            htmlFor='confirmPassword'
                            className='text-sm font-medium text-gray-200'
                        >
                            Confirm Password
                        </label>
                        <input
                            type='password'
                            id='confirmPassword'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className='w-full px-4 py-3 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300 transition duration-200'
                            placeholder='Confirm new password'
                            required
                            minLength={6}
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
                                Resetting...
                            </span>
                        ) : (
                            "Reset Password"
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
            </div>
        </div>
    );
};

export default ResetPassword;
