import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../utils/appConfig";
import { useError } from "../context/ErrorContext";
import { useAuth } from "../context/AuthContext";
import { handleSuccess } from "../utils/toastAlerts";
import { ToastContainer } from "react-toastify";

const ProjectEditPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { handleError } = useError();
    const { user, loading } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingProject, setIsLoadingProject] = useState(true);
    const [istServers, setIstServers] = useState([]);
    const [domains, setDomains] = useState([]);
    const [domainVersions, setDomainVersions] = useState([]);
    const [operationServices, setOperationServices] = useState([]);
    const [contacts, setContacts] = useState([]);

    // Form data for all steps
    const [formData, setFormData] = useState({
        // Step 1: Basic Information
        projectIdentifier: "",
        projectName: "",
        applicationName: "",
        projectDescription: "",

        // Step 2: Domain & Services Configuration
        selectedDomainId: "",
        selectedDomainVersionId: "",
        selectedOperationServices: [], // Array of operation service IDs

        // Step 3: Contacts Selection
        selectedContacts: [], // Array of contact IDs

        // Step 4: Advanced Configuration
        partnerPrismId: "",
        targetPlatform: "",
        targetPlatformOther: "",
        clientType: "",
        directInternetAccess: false,
        csiClientLoginName: "",
        istServerId: "",
    });

    // Static dropdown options
    const targetPlatformOptions = [
        { value: "Windows", label: "Windows" },
        { value: "Linux", label: "Linux" },
        { value: "MacOS", label: "MacOS" },
        { value: "Mobile", label: "Mobile" },
        { value: "Web", label: "Web" },
        { value: "Cloud", label: "Cloud" },
        { value: "Other", label: "Other" },
    ];

    const clientTypeOptions = [
        { value: "Enterprise", label: "Enterprise" },
        { value: "SMB", label: "Small & Medium Business" },
        { value: "Government", label: "Government" },
        { value: "Healthcare", label: "Healthcare" },
        { value: "Education", label: "Education" },
        { value: "Financial", label: "Financial Services" },
        { value: "Retail", label: "Retail" },
        { value: "Other", label: "Other" },
    ];

    // Check permissions
    const hasAdminAccess =
        user?.role === "ADMIN" || user?.role === "ONBOARDING";

    // Load project data and check permissions
    useEffect(() => {
        // Don't redirect if still loading authentication
        if (loading) {
            return;
        }

        if (!user) {
            handleError({
                response: {
                    status: 401,
                    data: "Please log in to edit a project.",
                },
            });
            navigate("/login");
            return;
        }

        if (!id) {
            handleError({
                response: {
                    status: 400,
                    data: "Project ID is required.",
                },
            });
            navigate("/projects");
            return;
        }

        loadProject();
        fetchIstServers();
        fetchDomains();
        fetchContacts();
    }, [user, loading, id, navigate, handleError]);

    const loadProject = async () => {
        setIsLoadingProject(true);
        try {
            const response = await apiClient.get(`/api/projects/${id}`);
            if (response.status === 200) {
                const project = response.data;

                // Check if user can edit this project
                if (!hasAdminAccess && project.userId !== user?.id) {
                    handleError({
                        response: {
                            status: 403,
                            data: "You don't have permission to edit this project.",
                        },
                    });
                    navigate("/projects");
                    return;
                }

                // Populate form data
                setFormData({
                    projectIdentifier: project.projectIdentifier || "",
                    projectName: project.projectName || "",
                    applicationName: project.applicationName || "",
                    projectDescription: project.projectDescription || "",
                    selectedDomainId: project.domainId || "",
                    selectedDomainVersionId: project.domainVersionId || "",
                    selectedOperationServices: project.operationServices || [],
                    selectedContacts: project.contacts || [],
                    partnerPrismId: project.partnerPrismId || "",
                    targetPlatform: project.targetPlatform || "",
                    targetPlatformOther: project.targetPlatformOther || "",
                    clientType: project.clientType || "",
                    directInternetAccess: project.directInternetAccess || false,
                    csiClientLoginName: project.csiClientLoginName || "",
                    istServerId: project.istServerId || "",
                });

                // If domain is selected, fetch its versions
                if (project.domainId) {
                    fetchDomainVersions(project.domainId);
                }
            }
        } catch (error) {
            handleError(error);
            navigate("/projects");
        } finally {
            setIsLoadingProject(false);
        }
    };

    const fetchIstServers = async () => {
        try {
            const response = await apiClient.get("/api/ist-server");
            if (response.status === 200) {
                setIstServers(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch IST servers:", error);
        }
    };

    const fetchDomains = async () => {
        try {
            const response = await apiClient.get("/api/domains");
            if (response.status === 200) {
                setDomains(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch domains:", error);
        }
    };

    const fetchDomainVersions = async (domainId) => {
        try {
            const response = await apiClient.get(
                `/api/domain-versions/domain/${domainId}`
            );
            if (response.status === 200) {
                setDomainVersions(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch domain versions:", error);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await apiClient.get("/api/contacts");
            if (response.status === 200) {
                setContacts(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // If domain is changed, fetch new domain versions
        if (field === "selectedDomainId") {
            setFormData((prev) => ({
                ...prev,
                selectedDomainVersionId: "", // Reset domain version
            }));
            if (value) {
                fetchDomainVersions(value);
            } else {
                setDomainVersions([]);
            }
        }
    };

    const handleContactToggle = (contactId) => {
        setFormData((prev) => ({
            ...prev,
            selectedContacts: prev.selectedContacts.includes(contactId)
                ? prev.selectedContacts.filter((id) => id !== contactId)
                : [...prev.selectedContacts, contactId],
        }));
    };

    const handleServiceToggle = (serviceId) => {
        setFormData((prev) => ({
            ...prev,
            selectedOperationServices: prev.selectedOperationServices.includes(
                serviceId
            )
                ? prev.selectedOperationServices.filter(
                      (id) => id !== serviceId
                  )
                : [...prev.selectedOperationServices, serviceId],
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const projectData = {
                projectIdentifier: formData.projectIdentifier,
                projectName: formData.projectName,
                applicationName: formData.applicationName,
                projectDescription: formData.projectDescription,
                domainId: formData.selectedDomainId || null,
                domainVersionId: formData.selectedDomainVersionId || null,
                operationServices: formData.selectedOperationServices,
                contacts: formData.selectedContacts,
                partnerPrismId: formData.partnerPrismId,
                targetPlatform: formData.targetPlatform,
                targetPlatformOther: formData.targetPlatformOther,
                clientType: formData.clientType,
                directInternetAccess: formData.directInternetAccess,
                csiClientLoginName: formData.csiClientLoginName,
                istServerId: formData.istServerId || null,
            };

            const response = await apiClient.put(
                `/api/projects/${id}`,
                projectData
            );

            if (response.status === 200) {
                handleSuccess("Project updated successfully!");
                navigate(`/projects/${id}/details`);
            }
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Show loading while project data is being fetched
    if (loading || isLoadingProject) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
                    <p className='mt-4 text-gray-600'>
                        {loading ? "Authenticating..." : "Loading project..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <ToastContainer />
            <div className='max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900'>
                                Edit Project
                            </h1>
                            <p className='text-gray-600 mt-2'>
                                Update your API project configuration
                            </p>
                        </div>
                        <div className='flex items-center space-x-2'>
                            {user && (
                                <div className='text-right'>
                                    <p className='text-sm font-medium text-gray-900'>
                                        {user.name}
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                        {user.email}
                                    </p>
                                </div>
                            )}
                            <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                                <svg
                                    className='w-6 h-6 text-blue-600'
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

                {/* Progress Steps */}
                <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
                    <div className='flex items-center justify-between'>
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className='flex items-center'
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        step <= currentStep
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-600"
                                    }`}
                                >
                                    {step}
                                </div>
                                <div className='ml-2'>
                                    <p
                                        className={`text-sm font-medium ${
                                            step <= currentStep
                                                ? "text-blue-600"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {step === 1 && "Basic Info"}
                                        {step === 2 && "Domain & Services"}
                                        {step === 3 && "Contacts"}
                                        {step === 4 && "Advanced Config"}
                                    </p>
                                </div>
                                {step < 4 && (
                                    <div className='w-16 h-px bg-gray-200 mx-4'></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Steps */}
                <div className='bg-white rounded-lg shadow-sm p-6'>
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div>
                            <h2 className='text-xl font-semibold text-gray-900 mb-6'>
                                Basic Information
                            </h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Project Identifier *
                                    </label>
                                    <input
                                        type='text'
                                        value={formData.projectIdentifier}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "projectIdentifier",
                                                e.target.value
                                            )
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder='e.g., API-PROJ-001'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Project Name *
                                    </label>
                                    <input
                                        type='text'
                                        value={formData.projectName}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "projectName",
                                                e.target.value
                                            )
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder='Enter project name'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Application Name *
                                    </label>
                                    <input
                                        type='text'
                                        value={formData.applicationName}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "applicationName",
                                                e.target.value
                                            )
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder='Enter application name'
                                        required
                                    />
                                </div>
                            </div>
                            <div className='mt-6'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Project Description
                                </label>
                                <textarea
                                    value={formData.projectDescription}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "projectDescription",
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    placeholder='Describe your project...'
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Domain & Services Configuration */}
                    {currentStep === 2 && (
                        <div>
                            <h2 className='text-xl font-semibold text-gray-900 mb-6'>
                                Domain & Services Configuration
                            </h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Domain
                                    </label>
                                    <select
                                        value={formData.selectedDomainId}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "selectedDomainId",
                                                e.target.value
                                            )
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    >
                                        <option value=''>
                                            Select a domain
                                        </option>
                                        {domains.map((domain) => (
                                            <option
                                                key={domain.id}
                                                value={domain.id}
                                            >
                                                {domain.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Domain Version
                                    </label>
                                    <select
                                        value={formData.selectedDomainVersionId}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "selectedDomainVersionId",
                                                e.target.value
                                            )
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        disabled={!formData.selectedDomainId}
                                    >
                                        <option value=''>
                                            Select a domain version
                                        </option>
                                        {domainVersions.map((version) => (
                                            <option
                                                key={version.id}
                                                value={version.id}
                                            >
                                                {version.version}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Operation Services would go here - simplified for now */}
                        </div>
                    )}

                    {/* Step 3: Contacts Selection */}
                    {currentStep === 3 && (
                        <div>
                            <h2 className='text-xl font-semibold text-gray-900 mb-6'>
                                Contacts Selection
                            </h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {contacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                            formData.selectedContacts.includes(
                                                contact.id
                                            )
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        onClick={() =>
                                            handleContactToggle(contact.id)
                                        }
                                    >
                                        <div className='flex items-center'>
                                            <input
                                                type='checkbox'
                                                checked={formData.selectedContacts.includes(
                                                    contact.id
                                                )}
                                                onChange={() =>
                                                    handleContactToggle(
                                                        contact.id
                                                    )
                                                }
                                                className='mr-3'
                                            />
                                            <div>
                                                <p className='font-medium'>
                                                    {contact.name}
                                                </p>
                                                <p className='text-sm text-gray-600'>
                                                    {contact.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Advanced Configuration */}
                    {currentStep === 4 && (
                        <div>
                            <h2 className='text-xl font-semibold text-gray-900 mb-6'>
                                Advanced Configuration
                            </h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Partner Prism ID
                                    </label>
                                    <input
                                        type='text'
                                        value={formData.partnerPrismId}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "partnerPrismId",
                                                e.target.value
                                            )
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder='Enter partner prism ID'
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Target Platform
                                    </label>
                                    <select
                                        value={formData.targetPlatform}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "targetPlatform",
                                                e.target.value
                                            )
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    >
                                        <option value=''>
                                            Select platform
                                        </option>
                                        {targetPlatformOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {formData.targetPlatform === "Other" && (
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Other Platform
                                        </label>
                                        <input
                                            type='text'
                                            value={formData.targetPlatformOther}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "targetPlatformOther",
                                                    e.target.value
                                                )
                                            }
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            placeholder='Specify other platform'
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        Client Type
                                    </label>
                                    <select
                                        value={formData.clientType}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "clientType",
                                                e.target.value
                                            )
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    >
                                        <option value=''>
                                            Select client type
                                        </option>
                                        {clientTypeOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        IST Server
                                    </label>
                                    <select
                                        value={formData.istServerId}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "istServerId",
                                                e.target.value
                                            )
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    >
                                        <option value=''>
                                            Select IST server
                                        </option>
                                        {istServers.map((server) => (
                                            <option
                                                key={server.id}
                                                value={server.id}
                                            >
                                                {server.serverName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                                        CSI Client Login Name
                                    </label>
                                    <input
                                        type='text'
                                        value={formData.csiClientLoginName}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "csiClientLoginName",
                                                e.target.value
                                            )
                                        }
                                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder='Enter CSI client login name'
                                    />
                                </div>
                            </div>
                            <div className='mt-6'>
                                <label className='flex items-center'>
                                    <input
                                        type='checkbox'
                                        checked={formData.directInternetAccess}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "directInternetAccess",
                                                e.target.checked
                                            )
                                        }
                                        className='mr-2'
                                    />
                                    <span className='text-sm font-medium text-gray-700'>
                                        Direct Internet Access Required
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className='flex justify-between mt-8'>
                        <div>
                            {currentStep > 1 && (
                                <button
                                    onClick={prevStep}
                                    className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200'
                                >
                                    Previous
                                </button>
                            )}
                        </div>
                        <div className='flex space-x-3'>
                            <button
                                onClick={() => navigate("/projects")}
                                className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200'
                            >
                                Cancel
                            </button>
                            {currentStep < 4 ? (
                                <button
                                    onClick={nextStep}
                                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200'
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50'
                                >
                                    {isLoading
                                        ? "Updating..."
                                        : "Update Project"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectEditPage;
