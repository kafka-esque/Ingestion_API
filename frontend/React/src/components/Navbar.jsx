import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { handleSuccess } from "../utils/toastAlerts";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, canManageServices } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Check if current page should show navbar
    const shouldShowNavbar = () => {
        const publicPaths = [
            "/login",
            "/signup",
            "/forgot-password",
            "/reset-password",
        ];
        return !publicPaths.some((path) => location.pathname.startsWith(path));
    };

    useEffect(() => {
        // No need for manual userInfo management as AuthContext handles it
    }, [location.pathname]);

    const handleLogout = () => {
        logout(); // Use AuthContext logout method
        handleSuccess("Logged out successfully!");
        setIsDropdownOpen(false);

        setTimeout(() => {
            navigate("/login", { replace: true });
        }, 1500);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Don't render navbar on public pages
    if (!shouldShowNavbar()) {
        return null;
    }

    return (
        <nav className='bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg border-b border-blue-700'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center h-16'>
                    {/* Brand/Logo */}
                    <div className='flex items-center'>
                        <div className='flex-shrink-0'>
                            <h1 className='text-2xl font-bold text-white'>
                                <span className='text-blue-300'>API</span>{" "}
                                Toolkit
                            </h1>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className='hidden md:block'>
                        <div className='ml-10 flex items-baseline space-x-4'>
                            <button
                                onClick={() => navigate("/home")}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                                    location.pathname === "/home"
                                        ? "bg-blue-700 text-white"
                                        : "text-blue-200 hover:text-white hover:bg-blue-700"
                                }`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => navigate("/projects")}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                                    location.pathname === "/projects"
                                        ? "bg-blue-700 text-white"
                                        : "text-blue-200 hover:text-white hover:bg-blue-700"
                                }`}
                            >
                                Projects
                            </button>
                            <button
                                onClick={() => navigate("/contacts")}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                                    location.pathname === "/contacts"
                                        ? "bg-blue-700 text-white"
                                        : "text-blue-200 hover:text-white hover:bg-blue-700"
                                }`}
                            >
                                Contacts
                            </button>
                            <button
                                onClick={() => navigate("/analytics")}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                                    location.pathname === "/analytics"
                                        ? "bg-blue-700 text-white"
                                        : "text-blue-200 hover:text-white hover:bg-blue-700"
                                }`}
                            >
                                Analytics
                            </button>

                            {/* Admin Link - Only show if user has admin privileges */}
                            {canManageServices() && (
                                <button
                                    onClick={() => navigate("/admin/dashboard")}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                                        location.pathname.startsWith("/admin")
                                            ? "bg-purple-700 text-white"
                                            : "text-purple-200 hover:text-white hover:bg-purple-700"
                                    }`}
                                >
                                    Admin
                                </button>
                            )}
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className='relative'>
                        <div className='flex items-center space-x-4'>
                            {/* User Info */}
                            <div className='hidden md:block text-right'>
                                <p className='text-sm text-blue-200'>
                                    Welcome back
                                </p>
                                <p className='text-sm font-medium text-white'>
                                    {user?.name || "User"}
                                </p>
                            </div>

                            {/* Profile Dropdown */}
                            <div className='relative'>
                                <button
                                    onClick={toggleDropdown}
                                    className='flex items-center space-x-2 bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                                        <span className='text-sm font-semibold'>
                                            {user?.name
                                                ?.charAt(0)
                                                .toUpperCase() || "U"}
                                        </span>
                                    </div>
                                    <span className='hidden sm:block'>
                                        {user?.name || "User"}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 transition-transform duration-200 ${
                                            isDropdownOpen ? "rotate-180" : ""
                                        }`}
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M19 9l-7 7-7-7'
                                        />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200'>
                                        <div className='px-4 py-2 text-sm text-gray-700 border-b border-gray-200'>
                                            <p className='font-medium'>
                                                {user?.name || "User"}
                                            </p>
                                            <p className='text-gray-500 truncate'>
                                                {user?.email || ""}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => {
                                                navigate("/profile");
                                                setIsDropdownOpen(false);
                                            }}
                                            className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200'
                                        >
                                            Profile Settings
                                        </button>

                                        <hr className='border-gray-200' />

                                        <button
                                            onClick={handleLogout}
                                            className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition duration-200'
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu button - for future mobile responsiveness */}
            <div className='md:hidden px-4 pb-3'>
                <div className='flex items-center justify-between'>
                    <span className='text-blue-200 text-sm'>
                        Welcome, {user?.name || "User"}
                    </span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
