import React, { useState, useEffect } from "react";
import { apiClient } from "../utils/appConfig";

const FetchProducts = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("No authentication token found");
                    return;
                }

                // Fetch user profile from backend
                const response = await apiClient.get("/api/auth/user/profile");
                setUserProfile(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching user profile:", error);

                if (error.response?.status === 401) {
                    setError("Authentication failed. Please login again.");
                    // Token might be expired, remove it
                    localStorage.removeItem("token");
                    localStorage.removeItem("userInfo");
                } else {
                    setError("Failed to fetch user profile");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (loading)
        return <div className='p-4 text-center'>Loading user profile...</div>;
    if (error)
        return <div className='p-4 text-center text-red-500'>{error}</div>;

    return (
        <div className='p-4'>
            <h2 className='text-2xl font-bold mb-4'>User Profile</h2>
            {userProfile ? (
                <div className='bg-white shadow-md rounded-lg p-6'>
                    <div className='mb-4'>
                        <h3 className='text-lg font-semibold text-gray-700'>
                            Profile Information
                        </h3>
                    </div>
                    <div className='space-y-3'>
                        <div>
                            <span className='font-medium text-gray-600'>
                                Name:{" "}
                            </span>
                            <span className='text-gray-800'>
                                {userProfile.name}
                            </span>
                        </div>
                        <div>
                            <span className='font-medium text-gray-600'>
                                Email:{" "}
                            </span>
                            <span className='text-gray-800'>
                                {userProfile.email}
                            </span>
                        </div>
                        <div>
                            <span className='font-medium text-gray-600'>
                                User ID:{" "}
                            </span>
                            <span className='text-gray-800'>
                                {userProfile.id}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='text-center text-gray-500'>
                    No profile data available
                </div>
            )}
        </div>
    );
};

export default FetchProducts;
