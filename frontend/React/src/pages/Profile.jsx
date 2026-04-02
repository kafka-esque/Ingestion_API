import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils/appConfig";
import { handleSuccess, handleError } from "../utils/toastAlerts";

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("profile");

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
        fetchUserProjects();
    }, [user]);

    const fetchUserProjects = async () => {
        try {
            setProjectsLoading(true);
            const response = await apiClient.get("/api/projects/my-projects");
            setProjects(response.data);
        } catch (error) {
            console.error("Error fetching projects:", error);
            setError("Failed to fetch projects");
        } finally {
            setProjectsLoading(false);
        }
    };

    const getProjectStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-800";
            case "completed":
                return "bg-blue-100 text-blue-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            formData.newPassword &&
            formData.newPassword !== formData.confirmPassword
        ) {
            setError("New passwords do not match");
            return;
        }

        if (formData.newPassword && !formData.currentPassword) {
            setError("Current password is required to set a new password");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const updateData = {
                name: formData.name,
                email: user.email, // Keep the same email
            };

            // Only include password fields if user wants to change password
            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.password = formData.newPassword;
            }

            const response = await apiClient.put(
                `/api/users/${user.id}/profile`,
                updateData
            );

            // Update user in auth context
            updateUser(response.data);

            handleSuccess("Profile updated successfully!");

            // Clear password fields
            setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
        } catch (error) {
            console.error("Error updating profile:", error);
            if (error.response?.status === 400) {
                setError(
                    error.response.data.message || "Invalid current password"
                );
            } else {
                setError("Failed to update profile");
            }
            handleError("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-100 py-8'>
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        User Profile
                    </h1>
                    <p className='mt-2 text-gray-600'>
                        Manage your personal information and view your projects
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className='mb-6'>
                    <nav className='flex space-x-8'>
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "profile"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            Profile Information
                        </button>
                        <button
                            onClick={() => setActiveTab("projects")}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "projects"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            My Projects ({projects.length})
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === "profile" && (
                    <div className='bg-white shadow rounded-lg'>
                        <div className='px-6 py-6'>
                            <h2 className='text-lg font-medium text-gray-900 mb-6'>
                                Edit Profile Information
                            </h2>

                            {error && (
                                <div className='mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
                                    {error}
                                    <button
                                        onClick={() => setError(null)}
                                        className='ml-2 text-red-700 hover:text-red-900'
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className='space-y-6'
                            >
                                {/* Basic Information */}
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div>
                                        <label
                                            htmlFor='name'
                                            className='block text-sm font-medium text-gray-700 mb-2'
                                        >
                                            Full Name
                                        </label>
                                        <input
                                            type='text'
                                            id='name'
                                            name='name'
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor='email'
                                            className='block text-sm font-medium text-gray-700 mb-2'
                                        >
                                            Email Address
                                        </label>
                                        <input
                                            type='email'
                                            id='email'
                                            value={user?.email || ""}
                                            disabled
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed'
                                        />
                                        <p className='mt-1 text-xs text-gray-500'>
                                            Email cannot be changed for security
                                            reasons
                                        </p>
                                    </div>
                                </div>

                                {/* Role Display */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Role
                                    </label>
                                    <span
                                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                            user?.role === "ADMIN"
                                                ? "bg-red-100 text-red-800"
                                                : user?.role === "ONBOARDING"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-green-100 text-green-800"
                                        }`}
                                    >
                                        {user?.role}
                                    </span>
                                </div>

                                {/* Password Change */}
                                <div className='border-t border-gray-200 pt-6'>
                                    <h3 className='text-md font-medium text-gray-900 mb-4'>
                                        Change Password (Optional)
                                    </h3>

                                    <div className='space-y-4'>
                                        <div>
                                            <label
                                                htmlFor='currentPassword'
                                                className='block text-sm font-medium text-gray-700 mb-2'
                                            >
                                                Current Password
                                            </label>
                                            <input
                                                type='password'
                                                id='currentPassword'
                                                name='currentPassword'
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                                            />
                                        </div>

                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div>
                                                <label
                                                    htmlFor='newPassword'
                                                    className='block text-sm font-medium text-gray-700 mb-2'
                                                >
                                                    New Password
                                                </label>
                                                <input
                                                    type='password'
                                                    id='newPassword'
                                                    name='newPassword'
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor='confirmPassword'
                                                    className='block text-sm font-medium text-gray-700 mb-2'
                                                >
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type='password'
                                                    id='confirmPassword'
                                                    name='confirmPassword'
                                                    value={
                                                        formData.confirmPassword
                                                    }
                                                    onChange={handleInputChange}
                                                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className='flex justify-end'>
                                    <button
                                        type='submit'
                                        disabled={loading}
                                        className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                                    >
                                        {loading
                                            ? "Updating..."
                                            : "Update Profile"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === "projects" && (
                    <div className='bg-white shadow rounded-lg'>
                        <div className='px-6 py-6'>
                            <div className='flex justify-between items-center mb-6'>
                                <h2 className='text-lg font-medium text-gray-900'>
                                    My Projects
                                </h2>
                                <Link
                                    to='/projects/create'
                                    className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200'
                                >
                                    Create New Project
                                </Link>
                            </div>

                            {projectsLoading ? (
                                <div className='flex justify-center items-center py-12'>
                                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                                </div>
                            ) : projects.length === 0 ? (
                                <div className='text-center py-12'>
                                    <svg
                                        className='mx-auto h-12 w-12 text-gray-400'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                        />
                                    </svg>
                                    <h3 className='mt-2 text-sm font-medium text-gray-900'>
                                        No projects found
                                    </h3>
                                    <p className='mt-1 text-sm text-gray-500'>
                                        Get started by creating your first
                                        project.
                                    </p>
                                    <div className='mt-6'>
                                        <Link
                                            to='/projects/create'
                                            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
                                        >
                                            Create Project
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {projects.map((project) => (
                                        <div
                                            key={project.id}
                                            className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200'
                                        >
                                            <div className='flex justify-between items-start mb-2'>
                                                <h3 className='text-lg font-medium text-gray-900 truncate'>
                                                    {project.projectName}
                                                </h3>
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${getProjectStatusColor(
                                                        project.status
                                                    )}`}
                                                >
                                                    {project.status || "Active"}
                                                </span>
                                            </div>
                                            <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
                                                {project.projectDescription ||
                                                    "No description available"}
                                            </p>

                                            {/* Show admin/onboarding update notification */}
                                            {project.lastModifiedByUserId &&
                                                project.lastModifiedByUserId !==
                                                    user?.id &&
                                                (project.lastModifiedByRole ===
                                                    "ADMIN" ||
                                                    project.lastModifiedByRole ===
                                                        "ONBOARDING") && (
                                                    <div className='mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md'>
                                                        <div className='flex items-center'>
                                                            <svg
                                                                className='h-4 w-4 text-blue-400 mr-1'
                                                                fill='none'
                                                                stroke='currentColor'
                                                                viewBox='0 0 24 24'
                                                            >
                                                                <path
                                                                    strokeLinecap='round'
                                                                    strokeLinejoin='round'
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                                                />
                                                            </svg>
                                                            <p className='text-xs text-blue-700'>
                                                                Updated by{" "}
                                                                {project.lastModifiedByRole.toLowerCase()}
                                                                {project.lastModifiedByUsername &&
                                                                    ` (${project.lastModifiedByUsername})`}
                                                                {project.updatedAt &&
                                                                    ` on ${new Date(
                                                                        project.updatedAt
                                                                    ).toLocaleDateString()}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                            <div className='flex justify-between items-center'>
                                                <div className='text-xs text-gray-500'>
                                                    <div>
                                                        Created:{" "}
                                                        {project.createdAt
                                                            ? new Date(
                                                                  project.createdAt
                                                              ).toLocaleDateString()
                                                            : "N/A"}
                                                    </div>
                                                    {project.updatedAt &&
                                                        project.createdAt !==
                                                            project.updatedAt && (
                                                            <div>
                                                                Updated:{" "}
                                                                {new Date(
                                                                    project.updatedAt
                                                                ).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                </div>
                                                <Link
                                                    to={`/projects/${project.id}/details`}
                                                    className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                                                >
                                                    View Details →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
