import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../utils/appConfig";
import { useError } from "../context/ErrorContext";
import { handleSuccess } from "../utils/toastAlerts";
import { ToastContainer } from "react-toastify";

const Login = () => {
    const navigate = useNavigate();
    const { handleError } = useError();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const savedError = localStorage.getItem("loginError");
        if (savedError) {
            setErrorMessage(savedError);
            handleError({ response: { status: 400, data: savedError } });
            localStorage.removeItem("loginError");
        }
    }, [handleError]);

    const handleChange = (e) => {
        setErrorMessage("");
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        const { email, password } = formData;
        if (!email || !password || !email.includes("@")) {
            const msg =
                !email || !password
                    ? "Please fill in all fields"
                    : "Please enter a valid email address";
            handleError({ response: { status: 400, data: msg } });
            setErrorMessage(msg);
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiClient.post("/api/auth/login", formData);

            const token = response.data;
            if (
                typeof token === "string" &&
                token.includes(".") &&
                token.split(".").length === 3
            ) {
                localStorage.setItem("token", token);

                try {
                    const base64Url = token.split(".")[1];
                    const base64 = base64Url
                        .replace(/-/g, "+")
                        .replace(/_/g, "/");
                    const jsonPayload = decodeURIComponent(
                        atob(base64)
                            .split("")
                            .map(
                                (c) =>
                                    "%" +
                                    ("00" + c.charCodeAt(0).toString(16)).slice(
                                        -2
                                    )
                            )
                            .join("")
                    );
                    const decoded = JSON.parse(jsonPayload);
                    const userInfo = {
                        name:
                            decoded.name || decoded.sub || email.split("@")[0],
                        email: decoded.email || decoded.username || email,
                    };
                    localStorage.setItem("userInfo", JSON.stringify(userInfo));
                } catch {
                    localStorage.setItem(
                        "userInfo",
                        JSON.stringify({ name: email.split("@")[0], email })
                    );
                }

                handleSuccess("Login successful!");
                setTimeout(() => navigate("/home", { replace: true }), 500);
            } else {
                throw new Error("Invalid token format");
            }
        } catch (error) {
            let message = "Login failed";
            if (error.response) {
                const { status, data } = error.response;
                message =
                    typeof data === "string"
                        ? data
                        : {
                              400: "Invalid request. Please check your input.",
                              401: "Invalid email or password.",
                              403: "Access forbidden. Please contact support.",
                              404: "Login service not found.",
                              429: "Too many login attempts.",
                              500: "Server error. Please try again later.",
                          }[status] || `Server error (${status})`;
            } else if (error.request) {
                message = "Network error. Please check your connection.";
            } else if (error.message) {
                message = error.message;
            }

            handleError(error);
            setErrorMessage(message);
            localStorage.setItem("loginError", message);
            if (error.response?.status === 401)
                setFormData({ ...formData, password: "" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () =>
        navigate("/forgot-password", { state: { email: formData.email } });

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 to-black'>
            <ToastContainer />
            <div className='bg-white/10 backdrop-blur-lg border border-white/20 w-full max-w-md p-8 rounded-2xl shadow-lg'>
                <div className='text-center space-y-3'>
                    <h1 className='text-3xl font-semibold text-white'>
                        Welcome Back
                    </h1>
                    <p className='text-gray-300'>Sign in to your account</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className='mt-6 space-y-5'
                >
                    {errorMessage && (
                        <div className='p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm'>
                            {errorMessage}
                        </div>
                    )}

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
                            className='w-full px-4 py-3 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300'
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
                            className='w-full px-4 py-3 bg-white/10 border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-300'
                            placeholder='Enter your password'
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center transition duration-300 ${
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
                                Signing in...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div className='flex flex-col items-center mt-6 space-y-3'>
                    <button
                        type='button'
                        onClick={handleForgotPassword}
                        className='text-sm text-blue-400 hover:text-blue-500 hover:underline'
                    >
                        Forgot your password?
                    </button>
                    <div className='text-gray-300 text-sm'>
                        Don't have an account?{" "}
                        <button
                            type='button'
                            onClick={() => navigate("/signup")}
                            className='text-blue-400 hover:text-blue-500 hover:underline'
                        >
                            Sign up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
