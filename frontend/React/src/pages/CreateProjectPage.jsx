import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../utils/appConfig";
import { useError } from "../context/ErrorContext";
import { useAuth } from "../context/AuthContext";
import { handleSuccess } from "../utils/toastAlerts";
import { ToastContainer } from "react-toastify";

const CreateProjectPage = () => {
    const navigate = useNavigate();
    const { handleError } = useError();
    const { user, loading } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
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

    // Fetch IST servers, domains, and contacts on component mount
    useEffect(() => {
        // Don't redirect if still loading authentication
        if (loading) {
            return;
        }

        // Check if user is authenticated
        if (!user) {
            handleError({
                response: {
                    status: 401,
                    data: "Please log in to create a project.",
                },
            });
            navigate("/login");
            return;
        }

        fetchIstServers();
        fetchDomains();
        fetchContacts();
    }, [user, loading, navigate, handleError]); // Added loading to dependency array

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
            const response = await apiClient.get("/api/domain");
            if (response.status === 200) {
                setDomains(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch domains:", error);
        }
    };

    const fetchContacts = async () => {
        try {
            // Use appropriate endpoint based on user role
            const endpoint =
                user && (user.role === "ADMIN" || user.role === "ONBOARDING")
                    ? "/api/contacts"
                    : "/api/contacts/my";

            const response = await apiClient.get(endpoint);
            if (response.status === 200) {
                setContacts(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch contacts:", error);
            // If the main endpoint fails, try the user-specific endpoint as fallback
            if (
                error.response?.status === 403 ||
                error.response?.status === 401
            ) {
                try {
                    const fallbackResponse = await apiClient.get(
                        "/api/contacts/my"
                    );
                    if (fallbackResponse.status === 200) {
                        setContacts(fallbackResponse.data || []);
                    }
                } catch (fallbackError) {
                    console.error(
                        "Fallback contact fetch also failed:",
                        fallbackError
                    );
                    setContacts([]);
                }
            } else {
                setContacts([]);
            }
        }
    };

    const fetchDomainVersions = async (domainId) => {
        try {
            const response = await apiClient.get(
                `/api/domain-version/domain/${domainId}`
            );
            if (response.status === 200) {
                setDomainVersions(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch domain versions:", error);
            setDomainVersions([]);
        }
    };

    const fetchOperationServices = async (domainId, versionId) => {
        try {
            const response = await apiClient.get(
                `/api/operation-services/domain/${domainId}/version/${versionId}`
            );
            if (response.status === 200) {
                setOperationServices(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch operation services:", error);
            setOperationServices([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            setFormData({
                ...formData,
                [name]: checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });

            // Handle cascading dropdowns
            if (name === "selectedDomainId" && value) {
                setFormData((prev) => ({
                    ...prev,
                    selectedDomainVersionId: "",
                    selectedOperationServices: [],
                }));
                setDomainVersions([]);
                setOperationServices([]);
                fetchDomainVersions(value);
            } else if (name === "selectedDomainVersionId" && value) {
                setFormData((prev) => ({
                    ...prev,
                    selectedOperationServices: [],
                }));
                setOperationServices([]);
                if (formData.selectedDomainId) {
                    fetchOperationServices(formData.selectedDomainId, value);
                }
            }
        }
    };

    const handleOperationServiceChange = (serviceId) => {
        const currentServices = formData.selectedOperationServices;
        const isSelected = currentServices.includes(serviceId);

        setFormData({
            ...formData,
            selectedOperationServices: isSelected
                ? currentServices.filter((id) => id !== serviceId)
                : [...currentServices, serviceId],
        });
    };

    const handleContactChange = (contactId) => {
        const currentContacts = formData.selectedContacts;
        const isSelected = currentContacts.includes(contactId);

        setFormData({
            ...formData,
            selectedContacts: isSelected
                ? currentContacts.filter((id) => id !== contactId)
                : [...currentContacts, contactId],
        });
    };

    // Validation for each step
    const validateStep = (step) => {
        const errors = [];

        switch (step) {
            case 1:
                if (!formData.projectIdentifier.trim()) {
                    errors.push("Project Identifier is required");
                }
                if (
                    formData.projectIdentifier.length < 3 ||
                    formData.projectIdentifier.length > 50
                ) {
                    errors.push(
                        "Project Identifier must be between 3 and 50 characters"
                    );
                }
                if (!formData.projectName.trim()) {
                    errors.push("Project Name is required");
                }
                if (formData.projectName.length > 100) {
                    errors.push("Project Name must not exceed 100 characters");
                }
                if (!formData.applicationName.trim()) {
                    errors.push("Application Name is required");
                }
                if (formData.applicationName.length > 100) {
                    errors.push(
                        "Application Name must not exceed 100 characters"
                    );
                }
                if (formData.projectDescription.length > 1000) {
                    errors.push(
                        "Project Description must not exceed 1000 characters"
                    );
                }
                break;

            case 2:
                if (!formData.selectedDomainId) {
                    errors.push("Domain is required");
                }
                if (!formData.selectedDomainVersionId) {
                    errors.push("Domain Version is required");
                }
                if (formData.selectedOperationServices.length === 0) {
                    errors.push(
                        "At least one Operation Service must be selected"
                    );
                }
                break;

            case 3:
                // Contacts are optional, so no validation required
                // Just proceed to next step
                break;

            case 4:
                if (!formData.partnerPrismId.trim()) {
                    errors.push("Partner Prism ID is required");
                }
                if (!formData.targetPlatform) {
                    errors.push("Target Platform is required");
                }
                if (!formData.clientType) {
                    errors.push("Client Type is required");
                }
                if (!formData.csiClientLoginName.trim()) {
                    errors.push("CSI Client Login Name is required");
                }
                break;

            default:
                break;
        }

        if (errors.length > 0) {
            handleError({ response: { status: 400, data: errors.join(", ") } });
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) return;

        setIsLoading(true);

        try {
            // Get current user ID from authentication context
            if (!user || !user.id) {
                handleError({
                    response: {
                        status: 401,
                        data: "User not authenticated. Please log in again.",
                    },
                });
                return;
            }

            // Step 1: Create the project
            const projectData = {
                projectIdentifier: formData.projectIdentifier.trim(),
                projectName: formData.projectName.trim(),
                applicationName: formData.applicationName.trim(),
                partnerPrismId: formData.partnerPrismId.trim(),
                targetPlatform: formData.targetPlatform,
                targetPlatformOther:
                    formData.targetPlatformOther?.trim() || null,
                clientType: formData.clientType,
                csiClientLoginName: formData.csiClientLoginName.trim(),
                directInternetAccess: formData.directInternetAccess,
                projectDescription: formData.projectDescription?.trim() || null,
                userId: user.id, // Use the authenticated user's ID
                istServerId: formData.istServerId
                    ? parseInt(formData.istServerId)
                    : null,
            };

            const projectResponse = await apiClient.post(
                "/api/projects",
                projectData
            );

            if (
                projectResponse.status === 200 ||
                projectResponse.status === 201
            ) {
                const createdProject = projectResponse.data;

                // Step 2: Add operation service mappings if any selected
                if (formData.selectedOperationServices.length > 0) {
                    await apiClient.post(
                        `/api/project-operations/project/${createdProject.id}/operations`,
                        formData.selectedOperationServices
                    );
                }

                // Step 3: Add contact mappings if any selected
                if (formData.selectedContacts.length > 0) {
                    await apiClient.post(
                        `/api/project-contacts/project/${createdProject.id}/contacts`,
                        formData.selectedContacts
                    );
                }

                handleSuccess("Project created successfully!");
                setTimeout(() => {
                    navigate("/projects", { replace: true });
                }, 1500);
            }
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepIndicator = () => {
        return (
            <div className='flex items-center justify-center mb-8'>
                {[1, 2, 3, 4].map((step) => (
                    <React.Fragment key={step}>
                        <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                step <= currentStep
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-300 text-gray-600"
                            }`}
                        >
                            {step}
                        </div>
                        {step < 4 && (
                            <div
                                className={`w-20 h-1 ${
                                    step < currentStep
                                        ? "bg-blue-600"
                                        : "bg-gray-300"
                                }`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const renderStep1 = () => (
        <div className='space-y-6'>
            <div className='text-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>
                    Basic Information
                </h2>
                <p className='text-gray-600'>
                    Enter the basic details for your project
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                    <label
                        htmlFor='projectIdentifier'
                        className='block text-sm font-medium text-gray-700 mb-2'
                    >
                        Project Identifier *
                    </label>
                    <input
                        type='text'
                        id='projectIdentifier'
                        name='projectIdentifier'
                        value={formData.projectIdentifier}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='e.g., PRJ-001'
                        minLength={3}
                        maxLength={50}
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                        3-50 characters
                    </p>
                </div>

                <div>
                    <label
                        htmlFor='projectName'
                        className='block text-sm font-medium text-gray-700 mb-2'
                    >
                        Project Name *
                    </label>
                    <input
                        type='text'
                        id='projectName'
                        name='projectName'
                        value={formData.projectName}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Enter project name'
                        maxLength={100}
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                        Max 100 characters
                    </p>
                </div>
            </div>

            <div>
                <label
                    htmlFor='applicationName'
                    className='block text-sm font-medium text-gray-700 mb-2'
                >
                    Application Name *
                </label>
                <input
                    type='text'
                    id='applicationName'
                    name='applicationName'
                    value={formData.applicationName}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Enter application name'
                    maxLength={100}
                />
                <p className='text-xs text-gray-500 mt-1'>Max 100 characters</p>
            </div>

            <div>
                <label
                    htmlFor='projectDescription'
                    className='block text-sm font-medium text-gray-700 mb-2'
                >
                    Project Description
                </label>
                <textarea
                    id='projectDescription'
                    name='projectDescription'
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={1000}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Enter project description (optional)'
                />
                <p className='text-xs text-gray-500 mt-1'>
                    {formData.projectDescription.length}/1000 characters
                </p>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className='space-y-6'>
            <div className='text-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>
                    Domain & Services Configuration
                </h2>
                <p className='text-gray-600'>
                    Select domain, version, and operation services
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                    <label
                        htmlFor='selectedDomainId'
                        className='block text-sm font-medium text-gray-700 mb-2'
                    >
                        Domain *
                    </label>
                    <select
                        id='selectedDomainId'
                        name='selectedDomainId'
                        value={formData.selectedDomainId}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                        <option value=''>Select domain</option>
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
                    <label
                        htmlFor='selectedDomainVersionId'
                        className='block text-sm font-medium text-gray-700 mb-2'
                    >
                        Domain Version *
                    </label>
                    <select
                        id='selectedDomainVersionId'
                        name='selectedDomainVersionId'
                        value={formData.selectedDomainVersionId}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        disabled={
                            !formData.selectedDomainId ||
                            domainVersions.length === 0
                        }
                    >
                        <option value=''>Select domain version</option>
                        {domainVersions.map((version) => (
                            <option
                                key={version.id}
                                value={version.id}
                            >
                                {version.version}
                            </option>
                        ))}
                    </select>
                    {formData.selectedDomainId &&
                        domainVersions.length === 0 && (
                            <p className='text-xs text-amber-600 mt-1'>
                                No versions available for selected domain
                            </p>
                        )}
                </div>
            </div>

            <div>
                <label className='block text-sm font-medium text-gray-700 mb-4'>
                    Operation Services * (Select at least one)
                </label>
                {operationServices.length === 0 ? (
                    <div className='text-center py-8 bg-gray-50 rounded-lg'>
                        <p className='text-gray-500'>
                            {!formData.selectedDomainId
                                ? "Please select a domain first"
                                : !formData.selectedDomainVersionId
                                ? "Please select a domain version first"
                                : "No operation services available for selected domain and version"}
                        </p>
                    </div>
                ) : (
                    <div className='space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4'>
                        {operationServices.map((service) => (
                            <div
                                key={service.id}
                                className='flex items-center'
                            >
                                <input
                                    type='checkbox'
                                    id={`service-${service.id}`}
                                    checked={formData.selectedOperationServices.includes(
                                        service.id
                                    )}
                                    onChange={() =>
                                        handleOperationServiceChange(service.id)
                                    }
                                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                                />
                                <label
                                    htmlFor={`service-${service.id}`}
                                    className='ml-3 block text-sm text-gray-700'
                                >
                                    {service.name}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
                {formData.selectedOperationServices.length > 0 && (
                    <p className='text-xs text-green-600 mt-2'>
                        {formData.selectedOperationServices.length} service(s)
                        selected
                    </p>
                )}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className='space-y-6'>
            <div className='text-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>
                    Contacts Selection
                </h2>
                <p className='text-gray-600'>
                    Select contacts for this project (optional)
                </p>
            </div>

            <div>
                <label className='block text-sm font-medium text-gray-700 mb-4'>
                    Project Contacts (Optional)
                </label>
                {contacts.length === 0 ? (
                    <div className='text-center py-8 bg-gray-50 rounded-lg'>
                        <p className='text-gray-500'>No contacts available</p>
                    </div>
                ) : (
                    <div className='space-y-3 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4'>
                        {contacts.map((contact) => (
                            <div
                                key={contact.id}
                                className='flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
                            >
                                <input
                                    type='checkbox'
                                    id={`contact-${contact.id}`}
                                    checked={formData.selectedContacts.includes(
                                        contact.id
                                    )}
                                    onChange={() =>
                                        handleContactChange(contact.id)
                                    }
                                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1'
                                />
                                <div className='flex-1 min-w-0'>
                                    <label
                                        htmlFor={`contact-${contact.id}`}
                                        className='block text-sm font-medium text-gray-900 cursor-pointer'
                                    >
                                        {contact.emailName}
                                    </label>
                                    <p className='text-sm text-gray-500'>
                                        {contact.emailId}
                                    </p>
                                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1'>
                                        {contact.contactType}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {formData.selectedContacts.length > 0 && (
                    <p className='text-xs text-green-600 mt-2'>
                        {formData.selectedContacts.length} contact(s) selected
                    </p>
                )}
            </div>

            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <div className='flex'>
                    <div className='flex-shrink-0'>
                        <svg
                            className='h-5 w-5 text-blue-400'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                        >
                            <path
                                fillRule='evenodd'
                                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                                clipRule='evenodd'
                            />
                        </svg>
                    </div>
                    <div className='ml-3'>
                        <h3 className='text-sm font-medium text-blue-800'>
                            Contact Selection
                        </h3>
                        <div className='mt-2 text-sm text-blue-700'>
                            <p>
                                You can select multiple contacts for this
                                project. Contacts are optional and can be added
                                or modified later.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className='space-y-6'>
            <div className='text-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>
                    Advanced Configuration
                </h2>
                <p className='text-gray-600'>
                    Configure platform, client settings, and advanced options
                </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                    <label
                        htmlFor='partnerPrismId'
                        className='block text-sm font-medium text-gray-700 mb-2'
                    >
                        Partner Prism ID *
                    </label>
                    <input
                        type='text'
                        id='partnerPrismId'
                        name='partnerPrismId'
                        value={formData.partnerPrismId}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Enter partner prism ID'
                    />
                </div>

                <div>
                    <label
                        htmlFor='targetPlatform'
                        className='block text-sm font-medium text-gray-700 mb-2'
                    >
                        Target Platform *
                    </label>
                    <select
                        id='targetPlatform'
                        name='targetPlatform'
                        value={formData.targetPlatform}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                        <option value=''>Select platform</option>
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
            </div>

            {formData.targetPlatform === "Other" && (
                <div>
                    <label
                        htmlFor='targetPlatformOther'
                        className='block text-sm font-medium text-gray-700 mb-2'
                    >
                        Other Platform Details
                    </label>
                    <input
                        type='text'
                        id='targetPlatformOther'
                        name='targetPlatformOther'
                        value={formData.targetPlatformOther}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Specify other platform'
                    />
                </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                    <label
                        htmlFor='clientType'
                        className='block text-sm font-medium text-gray-700 mb-2'
                    >
                        Client Type *
                    </label>
                    <select
                        id='clientType'
                        name='clientType'
                        value={formData.clientType}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                        <option value=''>Select client type</option>
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
                    <label
                        htmlFor='csiClientLoginName'
                        className='block text-sm font-medium text-gray-700 mb-2'
                    >
                        CSI Client Login Name *
                    </label>
                    <input
                        type='text'
                        id='csiClientLoginName'
                        name='csiClientLoginName'
                        value={formData.csiClientLoginName}
                        onChange={handleInputChange}
                        className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Enter CSI client login name'
                    />
                </div>
            </div>

            <div>
                <label
                    htmlFor='istServerId'
                    className='block text-sm font-medium text-gray-700 mb-2'
                >
                    IST Server (Optional)
                </label>
                <select
                    id='istServerId'
                    name='istServerId'
                    value={formData.istServerId}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                    <option value=''>Select IST server</option>
                    {istServers.map((server) => (
                        <option
                            key={server.id}
                            value={server.id}
                        >
                            {server.serverName ||
                                server.name ||
                                `Server ${server.id}`}
                        </option>
                    ))}
                </select>
            </div>

            <div className='flex items-center p-4 bg-blue-50 rounded-lg'>
                <input
                    type='checkbox'
                    id='directInternetAccess'
                    name='directInternetAccess'
                    checked={formData.directInternetAccess}
                    onChange={handleInputChange}
                    className='h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label
                    htmlFor='directInternetAccess'
                    className='ml-3 block text-sm font-medium text-gray-700'
                >
                    Enable Direct Internet Access
                </label>
            </div>

            {/* Summary Section */}
            <div className='mt-8 p-6 bg-gray-50 rounded-lg'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    Project Summary
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                    <div>
                        <span className='font-medium text-gray-700'>
                            Project:
                        </span>{" "}
                        {formData.projectName}
                    </div>
                    <div>
                        <span className='font-medium text-gray-700'>
                            Identifier:
                        </span>{" "}
                        {formData.projectIdentifier}
                    </div>
                    <div>
                        <span className='font-medium text-gray-700'>
                            Application:
                        </span>{" "}
                        {formData.applicationName}
                    </div>
                    <div>
                        <span className='font-medium text-gray-700'>
                            Platform:
                        </span>{" "}
                        {formData.targetPlatform}
                    </div>
                    <div>
                        <span className='font-medium text-gray-700'>
                            Client Type:
                        </span>{" "}
                        {formData.clientType}
                    </div>
                    <div>
                        <span className='font-medium text-gray-700'>
                            Partner ID:
                        </span>{" "}
                        {formData.partnerPrismId}
                    </div>
                    {formData.selectedOperationServices.length > 0 && (
                        <div className='md:col-span-2'>
                            <span className='font-medium text-gray-700'>
                                Operation Services:
                            </span>{" "}
                            {formData.selectedOperationServices.length} selected
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className='min-h-screen bg-gray-50'>
            <ToastContainer />

            {/* Show loading while authentication is being checked */}
            {loading ? (
                <div className='flex justify-center items-center min-h-screen'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
                        <p className='mt-4 text-gray-600'>Loading...</p>
                    </div>
                </div>
            ) : (
                <div className='max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
                    {/* Header */}
                    <div className='text-center mb-8'>
                        <h1 className='text-3xl font-bold text-gray-900'>
                            Create New Project
                        </h1>
                        <p className='text-gray-600 mt-2'>
                            Follow the steps to create your API project
                        </p>
                        {user && (
                            <div className='mt-3'>
                                <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
                                    <svg
                                        className='w-4 h-4 mr-1'
                                        fill='currentColor'
                                        viewBox='0 0 20 20'
                                    >
                                        <path
                                            fillRule='evenodd'
                                            d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'
                                            clipRule='evenodd'
                                        />
                                    </svg>
                                    Creating as: {user.name} ({user.role})
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Step Indicator */}
                    {renderStepIndicator()}

                    {/* Form Content */}
                    <div className='bg-white rounded-lg shadow-sm p-8'>
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                        {currentStep === 4 && renderStep4()}

                        {/* Navigation Buttons */}
                        <div className='flex justify-between items-center mt-8 pt-6 border-t border-gray-200'>
                            <div>
                                {currentStep > 1 && (
                                    <button
                                        onClick={handlePrevious}
                                        className='px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 flex items-center'
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
                                        Previous
                                    </button>
                                )}
                            </div>

                            <div className='flex space-x-3'>
                                <button
                                    onClick={() => navigate("/projects")}
                                    className='px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200'
                                >
                                    Cancel
                                </button>

                                {currentStep < 4 ? (
                                    <button
                                        onClick={handleNext}
                                        className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center'
                                    >
                                        Next
                                        <svg
                                            className='w-4 h-4 ml-2'
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
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className={`px-6 py-3 rounded-lg font-medium transition duration-200 flex items-center ${
                                            isLoading
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700"
                                        } text-white`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg
                                                    className='animate-spin h-4 w-4 mr-2'
                                                    viewBox='0 0 24 24'
                                                >
                                                    <circle
                                                        className='opacity-25'
                                                        cx='12'
                                                        cy='12'
                                                        r='10'
                                                        stroke='currentColor'
                                                        strokeWidth='4'
                                                        fill='none'
                                                    />
                                                    <path
                                                        className='opacity-75'
                                                        fill='currentColor'
                                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                                                    />
                                                </svg>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
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
                                                        d='M5 13l4 4L19 7'
                                                    />
                                                </svg>
                                                Create Project
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateProjectPage;
