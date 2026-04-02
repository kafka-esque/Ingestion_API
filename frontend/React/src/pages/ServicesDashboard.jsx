import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ServicesDashboard = () => {
    const { user, isAdmin, isOnboarding } = useAuth();

    const services = [
        {
            title: "IST Servers",
            description: "Manage IST Server configurations and settings",
            path: "/admin/ist-servers",
            icon: (
                <svg
                    className='h-8 w-8'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01'
                    />
                </svg>
            ),
            color: "bg-blue-500",
        },
        {
            title: "Domains",
            description: "Manage domain configurations and hierarchies",
            path: "/admin/domains",
            icon: (
                <svg
                    className='h-8 w-8'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9m9 9c5 0 9-4 9-9m-9 9c0 5 4 9 9 9M12 3c0 5 4 9 9 9'
                    />
                </svg>
            ),
            color: "bg-green-500",
        },
        {
            title: "Domain Versions",
            description: "Manage domain versioning and releases",
            path: "/admin/domain-versions",
            icon: (
                <svg
                    className='h-8 w-8'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                    />
                </svg>
            ),
            color: "bg-purple-500",
        },
        {
            title: "Operation Services",
            description: "Manage operation services and their configurations",
            path: "/admin/operation-services",
            icon: (
                <svg
                    className='h-8 w-8'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                    />
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                </svg>
            ),
            color: "bg-orange-500",
        },
        {
            title: "Project Management",
            description: "View and manage all projects in the system",
            path: "/admin/projects",
            icon: (
                <svg
                    className='h-8 w-8'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                    />
                </svg>
            ),
            color: "bg-teal-500",
        },
    ];

    // Admin-only services - only show to admin users
    const adminOnlyServices = [
        {
            title: "User Management",
            description: "Manage users, roles, and permissions",
            path: "/admin/users",
            icon: (
                <svg
                    className='h-8 w-8'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                    />
                </svg>
            ),
            color: "bg-indigo-500",
            adminOnly: true,
        },
    ];

    // Combine services based on user role
    const allServices = isAdmin()
        ? [...services, ...adminOnlyServices]
        : services;

    return (
        <div className='min-h-screen bg-gray-100 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-8'>
                    <div className='bg-white rounded-lg shadow-sm p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <h1 className='text-3xl font-bold text-gray-900'>
                                    Services Management Dashboard
                                </h1>
                                <p className='mt-2 text-gray-600'>
                                    Welcome back, {user?.name}! You have{" "}
                                    {isAdmin()
                                        ? "Administrator"
                                        : "Onboarding Team"}{" "}
                                    access.
                                </p>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        isAdmin()
                                            ? "bg-red-100 text-red-800"
                                            : "bg-blue-100 text-blue-800"
                                    }`}
                                >
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
                    {allServices.map((service, index) => (
                        <Link
                            key={index}
                            to={service.path}
                            className='bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6 block'
                        >
                            <div className='flex items-start space-x-4'>
                                <div
                                    className={`${service.color} text-white p-3 rounded-lg`}
                                >
                                    {service.icon}
                                </div>
                                <div className='flex-1'>
                                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                                        {service.title}
                                        {service.adminOnly && (
                                            <span className='ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full'>
                                                Admin Only
                                            </span>
                                        )}
                                    </h3>
                                    <p className='text-gray-600 mb-4'>
                                        {service.description}
                                    </p>
                                    <div className='flex items-center text-blue-600 hover:text-blue-800'>
                                        <span className='text-sm font-medium'>
                                            Manage {service.title}
                                        </span>
                                        <svg
                                            className='ml-2 h-4 w-4'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M9 5l7 7-7 7'
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Stats */}
                <div className='mt-8 bg-white rounded-lg shadow-sm p-6'>
                    <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                        Quick Actions
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                        {allServices
                            .filter(
                                (service) => !service.adminOnly || isAdmin()
                            )
                            .map((service, index) => (
                                <Link
                                    key={index}
                                    to={`${service.path}/create`}
                                    className='flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200'
                                >
                                    <div className='text-center'>
                                        <div className='text-gray-400 mb-2'>
                                            <svg
                                                className='h-6 w-6 mx-auto'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                                                />
                                            </svg>
                                        </div>
                                        <span className='text-sm text-gray-600'>
                                            Create {service.title.slice(0, -1)}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesDashboard;
