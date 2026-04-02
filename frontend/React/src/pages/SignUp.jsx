import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../utils/appConfig";
import { useError } from "../context/ErrorContext";
import { handleSuccess } from "../utils/toastAlerts";
import { ToastContainer } from "react-toastify";

const Signup = () => {
    const navigate = useNavigate();
    const { handleError } = useError();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        if (errorMessage) setErrorMessage("");
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        // Validation
        if (
            !formData.name?.trim() ||
            !formData.email?.trim() ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            const msg = "Please fill in all fields";
            handleError({
                response: { status: 400, data: msg },
            });
            setErrorMessage(msg);
            setIsLoading(false);
            return;
        }

        if (!formData.email.includes("@")) {
            const msg = "Please enter a valid email address";
            handleError({
                response: {
                    status: 400,
                    data: msg,
                },
            });
            setErrorMessage(msg);
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            const msg = "Passwords do not match";
            handleError({
                response: { status: 400, data: msg },
            });
            setErrorMessage(msg);
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            const msg = "Password must be at least 6 characters long";
            handleError({
                response: {
                    status: 400,
                    data: msg,
                },
            });
            setErrorMessage(msg);
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiClient.post("/api/auth/signup", {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            if (response.status === 200) {
                handleSuccess(
                    "Account created successfully! Redirecting to login..."
                );
                setTimeout(() => navigate("/login", { replace: true }), 1500);
            }
        } catch (error) {
            let errorMsg = "Signup failed";

            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;

                if (typeof data === "string") {
                    errorMsg = data;
                } else {
                    switch (status) {
                        case 400:
                            errorMsg =
                                "Invalid signup data. Please check your input.";
                            break;
                        case 409:
                            errorMsg = "User already exists with this email.";
                            break;
                        case 500:
                            errorMsg = "Server error. Please try again later.";
                            break;
                        default:
                            errorMsg = `Server error (${status}). Please try again.`;
                    }
                }
            } else if (error.request) {
                errorMsg =
                    "Network error. Please check if the server is running.";
            } else if (error.message) {
                errorMsg = error.message;
            }

            handleError(error);
            setErrorMessage(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-black py-12'>
            <ToastContainer />
            <div className='bg-white/10 backdrop-blur-lg border border-white/20 w-full max-w-md p-8 rounded-2xl shadow-lg'>
                <div className='text-center space-y-3'>
                    <h1 className='text-3xl font-semibold text-white drop-shadow-md'>
                        Create Account
                    </h1>
                    <p className='text-gray-300'>Sign up to get started</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className='mt-6 space-y-5'
                >
                    {/* Error message display */}
                    {errorMessage && (
                        <div className='p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm'>
                            {errorMessage}
                        </div>
                    )}

                    <div className='space-y-2'>
                        <label
                            htmlFor='name'
                            className='text-sm font-medium text-gray-200'
                        >
                            Full Name
                        </label>
                        <input
                            type='text'
                            id='name'
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            className='w-full px-4 py-3 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300 transition duration-200'
                            placeholder='Enter your full name'
                            required
                        />
                    </div>

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
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            className='w-full px-4 py-3 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300 transition duration-200'
                            placeholder='Enter your email'
                            required
                        />
                    </div>

                    <div className='space-y-2'>
                        <label
                            htmlFor='password'
                            className='text-sm font-medium text-gray-200'
                        >
                            Password
                        </label>
                        <input
                            type='password'
                            id='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            className='w-full px-4 py-3 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300 transition duration-200'
                            placeholder='Enter your password (min. 6 characters)'
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
                            name='confirmPassword'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className='w-full px-4 py-3 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300 transition duration-200'
                            placeholder='Confirm your password'
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium transition duration-300 flex items-center justify-center ${
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
                                Creating account...
                            </span>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <div className='text-center mt-6'>
                    <div className='text-gray-300 text-sm'>
                        Already have an account?{" "}
                        <button
                            onClick={() => navigate("/login")}
                            className='text-blue-400 hover:text-blue-500 hover:underline transition duration-200'
                        >
                            Sign in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
