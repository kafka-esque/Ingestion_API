import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../utils/appConfig";
import { useError } from "../context/ErrorContext";
import { useAuth } from "../context/AuthContext";
import { handleSuccess } from "../utils/toastAlerts";
import { ToastContainer } from "react-toastify";

const ProjectManagement = () => {
    const navigate = useNavigate();
    const { handleError } = useError();
    const { user, isAdmin, isOnboarding } = useAuth();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState("all-projects"); // "my-projects" or "all-projects"

    // Check if user has admin or onboarding permissions
    const hasAdminAccess = isAdmin() || isOnboarding();

    // Redirect non-admin users
    useEffect(() => {
        if (!hasAdminAccess) {
            navigate("/projects");
            return;
        }
    }, [hasAdminAccess, navigate]);

    // Fetch projects on component mount and when view mode changes
    useEffect(() => {
        if (hasAdminAccess) {
            fetchProjects();
        }
    }, [viewMode, hasAdminAccess]);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            let endpoint = "/api/projects"; // Default to all projects for admin view

            // Admin and onboarding can choose to view all projects or just their own
            if (viewMode === "my-projects") {
                endpoint = "/api/projects/my-projects";
            }

            const response = await apiClient.get(endpoint);
            if (response.status === 200) {
                setProjects(response.data || []);
            }
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm("Are you sure you want to delete this project?")) {
            return;
        }

        try {
            const response = await apiClient.delete(
                `/api/projects/${projectId}`
            );
            if (response.status === 200 || response.status === 204) {
                handleSuccess("Project deleted successfully!");
                fetchProjects(); // Refresh the list
            }
        } catch (error) {
            handleError(error);
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

    // Admin and onboarding can edit any project
    const canEditProject = () => hasAdminAccess;
    const canDeleteProject = () => hasAdminAccess;

    if (!hasAdminAccess) {
        return null; // Will redirect above
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <ToastContainer />
            <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                    <div className='flex justify-between items-center mb-4'>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900'>
                                Project Management
                            </h1>
                            <p className='text-gray-600 mt-2'>
                                {viewMode === "all-projects"
                                    ? "Manage all projects in the system"
                                    : "Manage your personal projects"}
                            </p>
                        </div>
                        <div className='flex items-center space-x-4'>
                            {/* View Mode Toggle */}
                            <div className='flex items-center space-x-2'>
                                <label className='text-sm font-medium text-gray-700'>
                                    View:
                                </label>
                                <select
                                    value={viewMode}
                                    onChange={(e) =>
                                        setViewMode(e.target.value)
                                    }
                                    className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <option value='all-projects'>
                                        All Projects
                                    </option>
                                    <option value='my-projects'>
                                        My Projects
                                    </option>
                                </select>
                            </div>
                            <button
                                onClick={() => navigate("/projects/create")}
                                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition duration-200 flex items-center'
                            >
                                <svg
                                    className='w-5 h-5 mr-2'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M12 4v16m8-8H4'
                                    />
                                </svg>
                                Create Project
                            </button>
                        </div>
                    </div>

                    {/* Admin/Onboarding Role Badge */}
                    <div className='flex items-center space-x-2'>
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isAdmin()
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                        >
                            <svg
                                className='w-3 h-3 mr-1'
                                fill='currentColor'
                                viewBox='0 0 20 20'
                            >
                                <path
                                    fillRule='evenodd'
                                    d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                                    clipRule='evenodd'
                                />
                            </svg>
                            {user?.role} ACCESS
                        </span>
                        <span className='text-xs text-gray-500'>
                            {viewMode === "all-projects"
                                ? "Viewing all projects in the system"
                                : "Viewing your personal projects"}
                        </span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
                    <div className='bg-white p-4 rounded-lg shadow-sm'>
                        <div className='flex items-center'>
                            <div className='p-3 rounded-full bg-blue-100'>
                                <svg
                                    className='h-6 w-6 text-blue-600'
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
                            </div>
                            <div className='ml-4'>
                                <p className='text-sm font-medium text-gray-600'>
                                    Total Projects
                                </p>
                                <p className='text-2xl font-semibold text-gray-900'>
                                    {projects.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white p-4 rounded-lg shadow-sm'>
                        <div className='flex items-center'>
                            <div className='p-3 rounded-full bg-green-100'>
                                <svg
                                    className='h-6 w-6 text-green-600'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                    />
                                </svg>
                            </div>
                            <div className='ml-4'>
                                <p className='text-sm font-medium text-gray-600'>
                                    Active Projects
                                </p>
                                <p className='text-2xl font-semibold text-gray-900'>
                                    {
                                        projects.filter(
                                            (p) =>
                                                p.status === "ACTIVE" ||
                                                !p.status
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white p-4 rounded-lg shadow-sm'>
                        <div className='flex items-center'>
                            <div className='p-3 rounded-full bg-yellow-100'>
                                <svg
                                    className='h-6 w-6 text-yellow-600'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                    />
                                </svg>
                            </div>
                            <div className='ml-4'>
                                <p className='text-sm font-medium text-gray-600'>
                                    Recent Updates
                                </p>
                                <p className='text-2xl font-semibold text-gray-900'>
                                    {
                                        projects.filter((p) => {
                                            const updatedAt = new Date(
                                                p.updatedAt
                                            );
                                            const weekAgo = new Date();
                                            weekAgo.setDate(
                                                weekAgo.getDate() - 7
                                            );
                                            return updatedAt > weekAgo;
                                        }).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white p-4 rounded-lg shadow-sm'>
                        <div className='flex items-center'>
                            <div className='p-3 rounded-full bg-purple-100'>
                                <svg
                                    className='h-6 w-6 text-purple-600'
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
                            </div>
                            <div className='ml-4'>
                                <p className='text-sm font-medium text-gray-600'>
                                    Unique Users
                                </p>
                                <p className='text-2xl font-semibold text-gray-900'>
                                    {
                                        new Set(projects.map((p) => p.userId))
                                            .size
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className='bg-white rounded-lg shadow-sm p-6'>
                    <div className='flex justify-between items-center mb-6'>
                        <h2 className='text-xl font-semibold text-gray-900'>
                            {viewMode === "all-projects"
                                ? "All Projects"
                                : "My Projects"}
                        </h2>
                        <div className='flex items-center space-x-2'>
                            <button
                                onClick={() => navigate("/admin/dashboard")}
                                className='text-gray-600 hover:text-gray-800 px-3 py-1 text-sm'
                            >
                                ← Back to Dashboard
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className='flex justify-center items-center py-12'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                            <span className='ml-3 text-gray-600'>
                                Loading projects...
                            </span>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className='text-center py-12'>
                            <svg
                                className='w-16 h-16 text-gray-400 mx-auto mb-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={1}
                                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                                />
                            </svg>
                            <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                No projects found
                            </h3>
                            <p className='text-gray-600 mb-4'>
                                {viewMode === "all-projects"
                                    ? "No projects exist in the system yet"
                                    : "You haven't created any projects yet"}
                            </p>
                            <button
                                onClick={() => navigate("/projects/create")}
                                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition duration-200'
                            >
                                Create Project
                            </button>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className='border border-gray-200 rounded-lg p-6 hover:shadow-md transition duration-200'
                                >
                                    <div className='flex justify-between items-start mb-4'>
                                        <div>
                                            <h3 className='text-lg font-semibold text-gray-900'>
                                                {project.projectName}
                                            </h3>
                                            <p className='text-sm text-gray-500'>
                                                ID: {project.projectIdentifier}
                                            </p>
                                            <p className='text-sm text-gray-600'>
                                                {project.applicationName}
                                            </p>
                                            {/* Show owner info for all projects view */}
                                            {viewMode === "all-projects" && (
                                                <p className='text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block'>
                                                    Owner: User ID{" "}
                                                    {project.userId}
                                                </p>
                                            )}
                                        </div>
                                        <div className='flex space-x-2'>
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/projects/${project.id}/details`
                                                    )
                                                }
                                                className='text-blue-600 hover:text-blue-800 p-1'
                                                title='View project details'
                                            >
                                                <svg
                                                    className='w-4 h-4'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                                    />
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                                    />
                                                </svg>
                                            </button>
                                            {canEditProject() && (
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/projects/${project.id}/edit`
                                                        )
                                                    }
                                                    className='text-yellow-600 hover:text-yellow-800 p-1'
                                                    title='Edit project'
                                                >
                                                    <svg
                                                        className='w-4 h-4'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        viewBox='0 0 24 24'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            strokeWidth={2}
                                                            d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                                        />
                                                    </svg>
                                                </button>
                                            )}
                                            {canDeleteProject() && (
                                                <button
                                                    onClick={() =>
                                                        handleDeleteProject(
                                                            project.id
                                                        )
                                                    }
                                                    className='text-red-600 hover:text-red-800 p-1'
                                                    title='Delete project'
                                                >
                                                    <svg
                                                        className='w-4 h-4'
                                                        fill='none'
                                                        stroke='currentColor'
                                                        viewBox='0 0 24 24'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            strokeWidth={2}
                                                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                                        />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className='space-y-2 mb-4'>
                                        <p className='text-sm text-gray-600'>
                                            <span className='font-medium'>
                                                Platform:
                                            </span>{" "}
                                            {project.targetPlatform}
                                            {project.targetPlatformOther &&
                                                ` (${project.targetPlatformOther})`}
                                        </p>
                                        <p className='text-sm text-gray-600'>
                                            <span className='font-medium'>
                                                Client Type:
                                            </span>{" "}
                                            {project.clientType}
                                        </p>
                                        <p className='text-sm text-gray-600'>
                                            <span className='font-medium'>
                                                Partner ID:
                                            </span>{" "}
                                            {project.partnerPrismId}
                                        </p>
                                        {project.directInternetAccess && (
                                            <span className='inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full'>
                                                Direct Internet Access
                                            </span>
                                        )}
                                    </div>
                                    <p className='text-gray-600 text-sm mb-4'>
                                        {project.projectDescription ||
                                            "No description provided"}
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
                                                            strokeWidth={2}
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

                                    <div className='flex justify-between items-center text-xs text-gray-500'>
                                        <div>
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
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${getProjectStatusColor(
                                                "active"
                                            )}`}
                                        >
                                            Active
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectManagement;
