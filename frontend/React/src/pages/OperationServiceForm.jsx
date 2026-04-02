import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiClient } from "../utils/appConfig";

const OperationServiceForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        name: "",
        domainId: "",
        versionId: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [domains, setDomains] = useState([]);
    const [domainVersions, setDomainVersions] = useState([]);
    const [filteredVersions, setFilteredVersions] = useState([]);

    useEffect(() => {
        fetchDomains();
        fetchDomainVersions();
        if (isEditing) {
            fetchOperationService();
        }
    }, [id, isEditing]);

    useEffect(() => {
        // Filter versions based on selected domain
        if (formData.domainId) {
            const filtered = domainVersions.filter(
                (version) => version.domainId === parseInt(formData.domainId)
            );
            setFilteredVersions(filtered);

            // Clear version selection if current version doesn't belong to selected domain
            if (formData.versionId) {
                const versionBelongsToDomain = filtered.some(
                    (version) => version.id === parseInt(formData.versionId)
                );
                if (!versionBelongsToDomain) {
                    setFormData((prev) => ({ ...prev, versionId: "" }));
                }
            }
        } else {
            setFilteredVersions([]);
            setFormData((prev) => ({ ...prev, versionId: "" }));
        }
    }, [formData.domainId, domainVersions]);

    const fetchDomains = async () => {
        try {
            const response = await apiClient.get("/api/domain");
            setDomains(response.data);
        } catch (error) {
            console.error("Error fetching domains:", error);
        }
    };

    const fetchDomainVersions = async () => {
        try {
            const response = await apiClient.get("/api/domain-version");
            setDomainVersions(response.data);
        } catch (error) {
            console.error("Error fetching domain versions:", error);
        }
    };

    const fetchOperationService = async () => {
        try {
            const response = await apiClient.get(
                `/api/operation-services/${id}`
            );
            setFormData({
                name: response.data.name || "",
                domainId: response.data.domainId || "",
                versionId: response.data.versionId || "",
            });
            setError(null);
        } catch (error) {
            setError("Failed to fetch operation service details");
            console.error("Error fetching operation service:", error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                domainId: parseInt(formData.domainId),
                versionId: parseInt(formData.versionId),
            };

            if (isEditing) {
                await apiClient.put(`/api/operation-services/${id}`, payload);
            } else {
                await apiClient.post("/api/operation-services", payload);
            }

            navigate("/admin/operation-services");
        } catch (error) {
            if (error.response?.status === 403) {
                setError(
                    "Access denied. You don't have permission to perform this action."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                        error.response?.data ||
                        `Failed to ${
                            isEditing ? "update" : "create"
                        } operation service`
                );
            }
            console.error("Error saving operation service:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const getDomainName = (domainId) => {
        const domain = domains.find((d) => d.id === domainId);
        return domain ? domain.name : `Domain ${domainId}`;
    };

    if (initialLoading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-green-500'></div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-100 py-8'>
            <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-8'>
                    <Link
                        to='/admin/operation-services'
                        className='text-green-600 hover:text-green-800 mb-2 inline-flex items-center'
                    >
                        <svg
                            className='h-4 w-4 mr-1'
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
                        Back to Operation Services
                    </Link>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        {isEditing
                            ? "Edit Operation Service"
                            : "Create New Operation Service"}
                    </h1>
                    <p className='mt-2 text-gray-600'>
                        {isEditing
                            ? "Update the operation service information"
                            : "Add a new operation service to a domain version"}
                    </p>
                </div>

                {/* Form */}
                <div className='bg-white shadow-sm rounded-lg'>
                    <form
                        onSubmit={handleSubmit}
                        className='p-6'
                    >
                        {/* Error Message */}
                        {error && (
                            <div className='mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
                                {error}
                            </div>
                        )}

                        {/* Service Name */}
                        <div className='mb-6'>
                            <label
                                htmlFor='name'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Service Name *
                            </label>
                            <input
                                type='text'
                                id='name'
                                name='name'
                                value={formData.name}
                                onChange={handleChange}
                                required
                                maxLength={100}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                                placeholder='Enter operation service name'
                            />
                            <p className='mt-1 text-sm text-gray-500'>
                                Enter a descriptive name for the operation
                                service (max 100 characters)
                            </p>
                        </div>

                        {/* Domain Selection */}
                        <div className='mb-6'>
                            <label
                                htmlFor='domainId'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Domain *
                            </label>
                            <select
                                id='domainId'
                                name='domainId'
                                value={formData.domainId}
                                onChange={handleChange}
                                required
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                            >
                                <option value=''>Select a domain</option>
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

                        {/* Version Selection */}
                        <div className='mb-6'>
                            <label
                                htmlFor='versionId'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Domain Version *
                            </label>
                            <select
                                id='versionId'
                                name='versionId'
                                value={formData.versionId}
                                onChange={handleChange}
                                required
                                disabled={!formData.domainId}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                                    !formData.domainId
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                <option value=''>
                                    {!formData.domainId
                                        ? "Select a domain first"
                                        : "Select a version"}
                                </option>
                                {filteredVersions.map((version) => (
                                    <option
                                        key={version.id}
                                        value={version.id}
                                    >
                                        {version.version} (Domain:{" "}
                                        {getDomainName(version.domainId)})
                                    </option>
                                ))}
                            </select>
                            {!formData.domainId && (
                                <p className='mt-1 text-sm text-gray-500'>
                                    Select a domain to see available versions
                                </p>
                            )}
                            {formData.domainId &&
                                filteredVersions.length === 0 && (
                                    <p className='mt-1 text-sm text-orange-600'>
                                        No versions found for the selected
                                        domain. Please create a domain version
                                        first.
                                    </p>
                                )}
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center justify-between'>
                            <Link
                                to='/admin/operation-services'
                                className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                            >
                                Cancel
                            </Link>
                            <button
                                type='submit'
                                disabled={
                                    loading ||
                                    (formData.domainId &&
                                        filteredVersions.length === 0)
                                }
                                className={`font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${
                                    loading ||
                                    (formData.domainId &&
                                        filteredVersions.length === 0)
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-500 hover:bg-green-700 text-white"
                                }`}
                            >
                                {loading
                                    ? "Saving..."
                                    : isEditing
                                    ? "Update Service"
                                    : "Create Service"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OperationServiceForm;
