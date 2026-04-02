import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../utils/appConfig";
import { useError } from "../context/ErrorContext";
import { useAuth } from "../context/AuthContext";
import { handleSuccess } from "../utils/toastAlerts";
import { ToastContainer } from "react-toastify";

const ProjectPage = () => {
    const navigate = useNavigate();
    const { handleError } = useError();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Check if user has admin or onboarding permissions (for display purposes)
    const hasAdminAccess =
        user?.role === "ADMIN" || user?.role === "ONBOARDING";

    // Fetch user's projects on component mount
    useEffect(() => {
        fetchMyProjects();
    }, []);

    const fetchMyProjects = async () => {
        setIsLoading(true);
        try {
            // Always fetch only user's own projects
            const response = await apiClient.get("/api/projects/my-projects");
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
                fetchMyProjects(); // Refresh the list
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

    const canEditProject = (project) => {
        // Admin and onboarding can edit any project
        if (hasAdminAccess) return true;
        // Regular users can only edit their own projects
        return project.userId === user?.id;
    };

    const canDeleteProject = (project) => {
        // Same logic as edit for now - can be customized
        return canEditProject(project);
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <ToastContainer />
            <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                    <div className='flex justify-between items-center mb-4'>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900'>
                                My Projects
                            </h1>
                            <p className='text-gray-600 mt-2'>
                                Manage your API projects and configurations
                            </p>
                        </div>
                        <div className='flex items-center space-x-4'>
                            {/* Admin/Onboarding users can access full project management */}
                            {hasAdminAccess && (
                                <button
                                    onClick={() => navigate("/admin/projects")}
                                    className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition duration-200 flex items-center'
                                    title='Access full project management dashboard'
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
                                            d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                                        />
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                        />
                                    </svg>
                                    Manage All Projects
                                </button>
                            )}
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

                    {/* Admin/Onboarding Role Badge - Optional info display */}
                    {hasAdminAccess && (
                        <div className='flex items-center space-x-2'>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user?.role === "ADMIN"
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
                                Use "Manage All Projects" for system-wide
                                management
                            </span>
                        </div>
                    )}
                </div>

                {/* Projects Grid */}
                <div className='bg-white rounded-lg shadow-sm p-6'>
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
                                No projects yet
                            </h3>
                            <p className='text-gray-600 mb-4'>
                                Get started by creating your first API project
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
                                            {canEditProject(project) && (
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
                                            {canDeleteProject(project) && (
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

export default ProjectPage;
