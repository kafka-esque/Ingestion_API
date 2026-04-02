import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RefreshHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const publicPaths = ["/login", "/signup", "/forgot-password"];
            const currentPath = location.pathname;

            console.log("🔁 RefreshHandler - Current path:", currentPath);
            console.log(
                "🔁 RefreshHandler - Token preview:",
                token?.slice(0, 20) || "No token"
            );

            const isResetPasswordPath =
                currentPath.startsWith("/reset-password");

            // ✅ Early exit if on public or reset-password route
            if (publicPaths.includes(currentPath) || isResetPasswordPath) {
                console.log("✅ On public path, skipping redirect");
                return;
            }

            // 🔐 Validate token structure (JWT)
            let isAuthenticated = false;

            if (token && token.includes(".") && token.split(".").length === 3) {
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
                    const decodedToken = JSON.parse(jsonPayload);
                    const currentTime = Math.floor(Date.now() / 1000);

                    // Check expiry
                    isAuthenticated =
                        !decodedToken.exp || decodedToken.exp > currentTime;

                    console.log("🔐 Token validity check:", {
                        exp: decodedToken.exp,
                        currentTime,
                        isAuthenticated,
                    });
                } catch (error) {
                    console.log("❌ Failed to decode token:", error);
                    isAuthenticated = false;
                }
            }

            if (isAuthenticated) {
                if (publicPaths.includes(currentPath) || currentPath === "/") {
                    console.log(
                        "✅ Authenticated on public/root path, redirecting to /home"
                    );
                    navigate("/home", { replace: true });
                } else {
                    console.log(
                        "✅ Authenticated and on protected path, no action needed"
                    );
                }
            } else {
                console.log("⚠️ Not authenticated or invalid token");

                // Clean up invalid tokens
                localStorage.removeItem("token");
                localStorage.removeItem("userInfo");

                // 🚫 Only redirect if NOT already on public path or reset-password
                if (
                    !publicPaths.includes(currentPath) &&
                    !isResetPasswordPath &&
                    currentPath !== "/" &&
                    currentPath !== "/login" // ✅ prevent re-navigation to same page
                ) {
                    console.log("🔁 Redirecting to /login from protected path");
                    navigate("/login", { replace: true });
                } else {
                    console.log(
                        "🛑 Already on /login or public path, no redirect"
                    );
                }
            }
        };

        // Delay to avoid race condition with login storage
        setTimeout(checkAuth, 200);
    }, [location.pathname, navigate]);

    return null;
};

export default RefreshHandler;
