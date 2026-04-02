import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../utils/appConfig";
import { useError } from "../context/ErrorContext";
import { useAuth } from "../context/AuthContext";
import { ToastContainer } from "react-toastify";

const ProjectDetailsPage = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { handleError } = useError();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [projectOperations, setProjectOperations] = useState([]);
    const [projectContacts, setProjectContacts] = useState([]);
    const [operationDetails, setOperationDetails] = useState([]);
    const [contactDetails, setContactDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user has admin or onboarding permissions
    const hasAdminAccess =
        user?.role === "ADMIN" || user?.role === "ONBOARDING";

    // Check if user can edit this project
    const canEditProject = (projectData) => {
        if (!projectData) return false;
        // Admin and onboarding can edit any project
        if (hasAdminAccess) return true;
        // Regular users can only edit their own projects
        return projectData.userId === user?.id;
    };

    useEffect(() => {
        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId]);

    const fetchProjectDetails = async () => {
        setIsLoading(true);
        try {
            // Fetch project basic details
            const projectResponse = await apiClient.get(
                `/api/projects/${projectId}`
            );
            setProject(projectResponse.data);

            // Fetch project operations
            const operationsResponse = await apiClient.get(
                `/api/project-operations/project/${projectId}`
            );
            setProjectOperations(operationsResponse.data || []);

            // Fetch project contacts
            const contactsResponse = await apiClient.get(
                `/api/project-contacts/project/${projectId}`
            );
            setProjectContacts(contactsResponse.data || []);

            // Fetch detailed operation service information
            if (operationsResponse.data && operationsResponse.data.length > 0) {
                const operationPromises = operationsResponse.data.map((op) =>
                    apiClient.get(`/api/operation-services/${op.serviceId}`)
                );
                const operationResults = await Promise.all(operationPromises);
                setOperationDetails(
                    operationResults.map((result) => result.data)
                );
            }

            // Fetch detailed contact information
            if (contactsResponse.data && contactsResponse.data.length > 0) {
                const contactPromises = contactsResponse.data.map((contact) =>
                    apiClient.get(`/api/contacts/${contact.contactId}`)
                );
                const contactResults = await Promise.all(contactPromises);
                setContactDetails(contactResults.map((result) => result.data));
            }
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                    <span className='ml-3 text-gray-600'>
                        Loading project details...
                    </span>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                        Project Not Found
                    </h2>
                    <p className='text-gray-600 mb-4'>
                        The project you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => navigate("/projects")}
                        className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md'
                    >
                        Back to Projects
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <ToastContainer />
            <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                    <div className='flex justify-between items-start'>
                        <div>
                            <button
                                onClick={() => navigate("/projects")}
                                className='text-blue-600 hover:text-blue-800 mb-4 flex items-center'
                            >
                                <svg
                                    className='w-4 h-4 mr-2'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M15 19l-7-7 7-7'
                                    />
                                </svg>
                                Back to Projects
                            </button>
                            <h1 className='text-3xl font-bold text-gray-900'>
                                {project.projectName}
                            </h1>
                            <p className='text-gray-600 mt-2'>
                                Project ID: {project.projectIdentifier}
                            </p>
                            <p className='text-gray-700 mt-1'>
                                {project.applicationName}
                            </p>

                            {/* Admin/Onboarding Role Badge */}
                            {hasAdminAccess && (
                                <div className='mt-2'>
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
                                </div>
                            )}
                        </div>
                        <div className='text-right space-y-2'>
                            <div>
                                <span className='inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'>
                                    Active
                                </span>
                            </div>
                            {canEditProject(project) && (
                                <div>
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/projects/${project.id}/edit`
                                            )
                                        }
                                        className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200'
                                    >
                                        Edit Project
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Project Information */}
                    <div className='bg-white rounded-lg shadow-sm p-6'>
                        <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                            Project Information
                        </h2>
                        <div className='space-y-3'>
                            <div>
                                <span className='font-medium text-gray-700'>
                                    Description:
                                </span>
                                <p className='text-gray-600 mt-1'>
                                    {project.projectDescription ||
                                        "No description provided"}
                                </p>
                            </div>
                            <div>
                                <span className='font-medium text-gray-700'>
                                    Target Platform:
                                </span>
                                <span className='ml-2 text-gray-600'>
                                    {project.targetPlatform}
                                    {project.targetPlatformOther &&
                                        ` (${project.targetPlatformOther})`}
                                </span>
                            </div>
                            <div>
                                <span className='font-medium text-gray-700'>
                                    Client Type:
                                </span>
                                <span className='ml-2 text-gray-600'>
                                    {project.clientType}
                                </span>
                            </div>
                            <div>
                                <span className='font-medium text-gray-700'>
                                    Partner Prism ID:
                                </span>
                                <span className='ml-2 text-gray-600'>
                                    {project.partnerPrismId}
                                </span>
                            </div>
                            <div>
                                <span className='font-medium text-gray-700'>
                                    CSI Client Login:
                                </span>
                                <span className='ml-2 text-gray-600'>
                                    {project.csiClientLoginName}
                                </span>
                            </div>
                            {project.directInternetAccess && (
                                <div>
                                    <span className='inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'>
                                        Direct Internet Access Enabled
                                    </span>
                                </div>
                            )}

                            {/* Audit Information */}
                            <div className='pt-4 border-t border-gray-200'>
                                <h3 className='font-medium text-gray-700 mb-3'>
                                    Audit Information
                                </h3>
                                <div className='space-y-2 text-sm'>
                                    {project.createdAt && (
                                        <div>
                                            <span className='font-medium text-gray-600'>
                                                Created:
                                            </span>
                                            <span className='ml-2 text-gray-500'>
                                                {new Date(
                                                    project.createdAt
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {project.updatedAt &&
                                        project.createdAt !==
                                            project.updatedAt && (
                                            <div>
                                                <span className='font-medium text-gray-600'>
                                                    Last Updated:
                                                </span>
                                                <span className='ml-2 text-gray-500'>
                                                    {new Date(
                                                        project.updatedAt
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    {project.lastModifiedByUsername && (
                                        <div>
                                            <span className='font-medium text-gray-600'>
                                                Last Modified By:
                                            </span>
                                            <span className='ml-2 text-gray-500'>
                                                {project.lastModifiedByUsername}{" "}
                                                ({project.lastModifiedByRole})
                                            </span>
                                        </div>
                                    )}

                                    {/* Show admin/onboarding update notification */}
                                    {project.lastModifiedByUserId &&
                                        project.lastModifiedByUserId !==
                                            user?.id &&
                                        (project.lastModifiedByRole ===
                                            "ADMIN" ||
                                            project.lastModifiedByRole ===
                                                "ONBOARDING") && (
                                            <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md'>
                                                <div className='flex items-center'>
                                                    <svg
                                                        className='h-4 w-4 text-blue-400 mr-2'
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
                                                    <div>
                                                        <p className='text-sm font-medium text-blue-800'>
                                                            Project Updated by{" "}
                                                            {
                                                                project.lastModifiedByRole
                                                            }
                                                        </p>
                                                        <p className='text-xs text-blue-700'>
                                                            {
                                                                project.lastModifiedByUsername
                                                            }{" "}
                                                            updated this project
                                                            on{" "}
                                                            {new Date(
                                                                project.updatedAt
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Domain & Operation Services */}
                    <div className='bg-white rounded-lg shadow-sm p-6'>
                        <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                            Operation Services
                        </h2>
                        {operationDetails.length === 0 ? (
                            <div className='text-center py-8'>
                                <svg
                                    className='w-12 h-12 text-gray-400 mx-auto mb-4'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={1}
                                        d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                                    />
                                </svg>
                                <p className='text-gray-500'>
                                    No operation services configured
                                </p>
                            </div>
                        ) : (
                            <div className='space-y-3'>
                                {operationDetails.map((service, index) => (
                                    <div
                                        key={index}
                                        className='border border-gray-200 rounded-lg p-4'
                                    >
                                        <div className='flex justify-between items-start'>
                                            <div>
                                                <h3 className='font-medium text-gray-900'>
                                                    {service.name}
                                                </h3>
                                                <p className='text-sm text-gray-500'>
                                                    Service ID: {service.id}
                                                </p>
                                            </div>
                                            <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs'>
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Project Contacts */}
                <div className='bg-white rounded-lg shadow-sm p-6 mt-6'>
                    <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                        Project Contacts
                    </h2>
                    {contactDetails.length === 0 ? (
                        <div className='text-center py-8'>
                            <svg
                                className='w-12 h-12 text-gray-400 mx-auto mb-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={1}
                                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                                />
                            </svg>
                            <p className='text-gray-500'>
                                No contacts assigned to this project
                            </p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {contactDetails.map((contact, index) => (
                                <div
                                    key={index}
                                    className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200'
                                >
                                    <div className='flex items-start justify-between'>
                                        <div className='flex-1'>
                                            <h3 className='font-medium text-gray-900'>
                                                {contact.emailName}
                                            </h3>
                                            <p className='text-sm text-gray-600 mt-1'>
                                                {contact.emailId}
                                            </p>
                                            <span className='inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs mt-2'>
                                                {contact.contactType}
                                            </span>
                                        </div>
                                        <div className='ml-2'>
                                            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                                                <svg
                                                    className='w-4 h-4 text-blue-600'
                                                    fill='none'
                                                    stroke='currentColor'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <path
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                        strokeWidth={2}
                                                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className='bg-white rounded-lg shadow-sm p-6 mt-6'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <h3 className='text-lg font-medium text-gray-900'>
                                Project Actions
                            </h3>
                            <p className='text-gray-600'>
                                Manage this project and its configurations
                            </p>
                        </div>
                        <div className='flex space-x-3'>
                            <button
                                onClick={() => navigate("/projects")}
                                className='px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200'
                            >
                                Back to Projects
                            </button>
                            <button
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            "Are you sure you want to delete this project?"
                                        )
                                    ) {
                                        // Handle delete project
                                        navigate("/projects");
                                    }
                                }}
                                className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200'
                            >
                                Delete Project
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailsPage;
