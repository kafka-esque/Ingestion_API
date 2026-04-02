import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiClient } from "../utils/appConfig";

const DomainVersionForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        version: "",
        domainId: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [domains, setDomains] = useState([]);

    useEffect(() => {
        fetchDomains();
        if (isEditing) {
            fetchDomainVersion();
        }
    }, [id, isEditing]);

    const fetchDomains = async () => {
        try {
            const response = await apiClient.get("/api/domain");
            setDomains(response.data);
        } catch (error) {
            console.error("Error fetching domains:", error);
        }
    };

    const fetchDomainVersion = async () => {
        try {
            const response = await apiClient.get(`/api/domain-version/${id}`);
            setFormData({
                version: response.data.version || "",
                domainId: response.data.domainId || "",
            });
            setError(null);
        } catch (error) {
            setError("Failed to fetch domain version details");
            console.error("Error fetching domain version:", error);
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
            };

            if (isEditing) {
                await apiClient.put(`/api/domain-version/${id}`, payload);
            } else {
                await apiClient.post("/api/domain-version", payload);
            }

            navigate("/admin/domain-versions");
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
                        } domain version`
                );
            }
            console.error("Error saving domain version:", error);
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
                        to='/admin/domain-versions'
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
                        Back to Domain Versions
                    </Link>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        {isEditing
                            ? "Edit Domain Version"
                            : "Create New Domain Version"}
                    </h1>
                    <p className='mt-2 text-gray-600'>
                        {isEditing
                            ? "Update the domain version information"
                            : "Add a new version to a domain"}
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
                                disabled={isEditing} // Don't allow changing domain when editing
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                                    isEditing
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                }`}
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
                            {isEditing && (
                                <p className='mt-1 text-sm text-gray-500'>
                                    Domain cannot be changed when editing
                                </p>
                            )}
                        </div>

                        {/* Version */}
                        <div className='mb-6'>
                            <label
                                htmlFor='version'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Version *
                            </label>
                            <input
                                type='text'
                                id='version'
                                name='version'
                                value={formData.version}
                                onChange={handleChange}
                                required
                                maxLength={50}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                                placeholder='e.g., 1.0.0, v2.1, beta-1'
                            />
                            <p className='mt-1 text-sm text-gray-500'>
                                Enter a version identifier (max 50 characters)
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center justify-between'>
                            <Link
                                to='/admin/domain-versions'
                                className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                            >
                                Cancel
                            </Link>
                            <button
                                type='submit'
                                disabled={loading}
                                className={`font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${
                                    loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-500 hover:bg-green-700 text-white"
                                }`}
                            >
                                {loading
                                    ? "Saving..."
                                    : isEditing
                                    ? "Update Version"
                                    : "Create Version"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DomainVersionForm;
