import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Component to protect routes that require admin or onboarding permissions
const AdminRoute = ({ children }) => {
    const { user, canManageServices, loading } = useAuth();

    console.log(
        "AdminRoute - loading:",
        loading,
        "user:",
        user,
        "canManageServices:",
        canManageServices()
    );

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    if (!user) {
        console.log("AdminRoute - No user found, redirecting to login");
        return (
            <Navigate
                to='/login'
                replace
            />
        );
    }

    if (!canManageServices()) {
        console.log("AdminRoute - User lacks admin permissions");
        return (
            <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
                <div className='bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center'>
                    <div className='mb-4'>
                        <svg
                            className='mx-auto h-16 w-16 text-red-500'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
                            />
                        </svg>
                    </div>
                    <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                        Access Denied
                    </h1>
                    <p className='text-gray-600 mb-6'>
                        You don't have permission to access this page. Only
                        ADMIN and ONBOARDING team members can manage services.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminRoute;
