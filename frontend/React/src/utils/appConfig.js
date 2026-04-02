// API configuration for Spring Boot backend
const API_CONFIG = {
    // Base URL for your Spring Boot backend
    BASE_URL: "http://localhost:8080",

    // API endpoints
    ENDPOINTS: {
        SIGNUP: "/api/auth/signup",
        LOGIN: "/api/auth/login",
        FORGOT_PASSWORD: "/api/auth/forgot-password",
        RESET_PASSWORD: "/api/auth/reset-password", // Note: token will be appended to this
    },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint, pathParam = "") => {
    return `${API_CONFIG.BASE_URL}${endpoint}${pathParam}`;
};

// Axios instance with default configuration
import axios from "axios";

export const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000, // 30 second timeout - increased for email operations
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); // Changed from 'authToken' to 'token'
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("token"); // Changed from 'authToken' to 'token'
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default API_CONFIG;
