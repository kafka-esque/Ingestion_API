import React, { useEffect, useState } from "react";
import FetchProducts from "../components/FetchProducts"; // This now shows user profile

const Home = () => {
    const [userInfo, setUserInfo] = useState(null);

    // Function to decode JWT token
    const decodeJWT = (token) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => {
                        return (
                            "%" +
                            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                        );
                    })
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Error decoding JWT:", error);
            return null;
        }
    };

    useEffect(() => {
        // First try to get userInfo from localStorage
        let userInfo = localStorage.getItem("userInfo");

        if (userInfo) {
            try {
                userInfo = JSON.parse(userInfo);
                setUserInfo(userInfo);
            } catch (error) {
                console.error("Error parsing userInfo:", error);
                localStorage.removeItem("userInfo");
            }
        } else {
            // If userInfo is not available, try to extract from JWT token
            const token = localStorage.getItem("token");
            if (token) {
                const decodedToken = decodeJWT(token);
                if (decodedToken) {
                    const extractedUserInfo = {
                        name: decodedToken.name || decodedToken.sub || "User",
                        email:
                            decodedToken.email || decodedToken.username || "",
                    };
                    setUserInfo(extractedUserInfo);
                    // Store it for future use
                    localStorage.setItem(
                        "userInfo",
                        JSON.stringify(extractedUserInfo)
                    );
                }
            }
        }
    }, []);

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
                <div className='bg-white rounded-lg shadow-sm p-6'>
                    <div className='mb-6'>
                        <h1 className='text-3xl font-bold text-gray-900'>
                            Welcome back, {userInfo?.name || "User"}!
                        </h1>
                        <p className='text-gray-600 mt-2'>
                            Here's your dashboard overview
                        </p>
                    </div>

                    <FetchProducts />
                </div>
            </div>
        </div>
    );
};

export default Home;
