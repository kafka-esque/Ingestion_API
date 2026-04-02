import React, { createContext, useState, useContext, useEffect } from "react";
import { apiClient } from "../utils/appConfig";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem("token"));

    const fetchUserProfile = async () => {
        try {
            console.log("🔄 Fetching user profile...");
            const token = localStorage.getItem("token");
            console.log(
                "🔑 Token exists:",
                !!token,
                "Token preview:",
                token?.substring(0, 20)
            );

            const response = await apiClient.get("/api/auth/user/profile");
            console.log("✅ User profile fetched successfully:", response.data);
            setUser(response.data);
        } catch (error) {
            console.error("❌ Failed to fetch user profile:", error);
            console.error("❌ Error response:", error.response?.data);
            console.error("❌ Error status:", error.response?.status);

            // If we get 401 or 403, the token is invalid - clear it
            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                console.log(
                    "🔄 Token invalid, clearing and redirecting to login"
                );
            }
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Check if user is authenticated and get user data
    useEffect(() => {
        console.log("🚀 AuthProvider useEffect triggered");
        const token = localStorage.getItem("token");
        console.log("🔑 Token in useEffect:", !!token);
        if (token) {
            console.log("📞 Calling fetchUserProfile from useEffect");
            fetchUserProfile();
        } else {
            console.log("❌ No token found, setting loading to false");
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiClient.post("/api/auth/login", {
                email,
                password,
            });

            const token = response.data;
            localStorage.setItem("token", token);
            setToken(token);

            // Fetch user profile after login
            await fetchUserProfile();

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data || "Login failed",
            };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = () => {
        const result = !!user;
        console.log("isAuthenticated check:", result, "user:", user);
        return result;
    };

    const hasRole = (roles) => {
        if (!user || !user.role) {
            console.log("hasRole - no user or role:", user);
            return false;
        }

        const userRole = user.role.toUpperCase();
        let result;

        if (Array.isArray(roles)) {
            result = roles.map((r) => r.toUpperCase()).includes(userRole);
        } else {
            result = userRole === roles.toUpperCase();
        }

        console.log(
            "hasRole check:",
            roles,
            "user role:",
            userRole,
            "result:",
            result
        );
        return result;
    };

    const isAdmin = () => {
        return hasRole("ADMIN");
    };

    const isOnboarding = () => {
        return hasRole("ONBOARDING");
    };

    const canManageServices = () => {
        const result = hasRole(["ADMIN", "ONBOARDING"]);
        console.log("canManageServices result:", result);
        return result;
    };

    const updateUser = (updatedUserData) => {
        console.log("🔄 Updating user data:", updatedUserData);
        setUser(updatedUserData);
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        hasRole,
        isAdmin,
        isOnboarding,
        canManageServices,
        fetchUserProfile,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
