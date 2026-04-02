import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiClient } from "../utils/appConfig";

const DomainForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        parentDomainId: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoading, setInitialLoading] = useState(isEditing);
    const [parentDomains, setParentDomains] = useState([]);

    useEffect(() => {
        fetchParentDomains();
        if (isEditing) {
            fetchDomain();
        }
    }, [id, isEditing]);

    const fetchParentDomains = async () => {
        try {
            const response = await apiClient.get("/api/domain");
            setParentDomains(response.data);
        } catch (error) {
            console.error("Error fetching parent domains:", error);
        }
    };

    const fetchDomain = async () => {
        try {
            const response = await apiClient.get(`/api/domain/${id}`);
            setFormData({
                name: response.data.name || "",
                description: response.data.description || "",
                parentDomainId: response.data.parentDomainId || "",
            });
            setError(null);
        } catch (error) {
            setError("Failed to fetch domain details");
            console.error("Error fetching domain:", error);
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
                parentDomainId: formData.parentDomainId || null,
            };

            if (isEditing) {
                await apiClient.put(`/api/domain/${id}`, payload);
            } else {
                await apiClient.post("/api/domain", payload);
            }

            navigate("/admin/domains");
        } catch (error) {
            if (error.response?.status === 403) {
                setError(
                    "Access denied. You don't have permission to perform this action."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                        error.response?.data ||
                        `Failed to ${isEditing ? "update" : "create"} domain`
                );
            }
            console.error("Error saving domain:", error);
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
                        to='/admin/domains'
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
                        Back to Domains
                    </Link>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        {isEditing ? "Edit Domain" : "Create New Domain"}
                    </h1>
                    <p className='mt-2 text-gray-600'>
                        {isEditing
                            ? "Update the domain information"
                            : "Add a new domain to the system"}
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

                        {/* Domain Name */}
                        <div className='mb-6'>
                            <label
                                htmlFor='name'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Domain Name *
                            </label>
                            <input
                                type='text'
                                id='name'
                                name='name'
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                                placeholder='Enter domain name'
                            />
                        </div>

                        {/* Description */}
                        <div className='mb-6'>
                            <label
                                htmlFor='description'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Description
                            </label>
                            <textarea
                                id='description'
                                name='description'
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                                placeholder='Enter domain description (optional)'
                            />
                        </div>

                        {/* Parent Domain */}
                        <div className='mb-6'>
                            <label
                                htmlFor='parentDomainId'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Parent Domain
                            </label>
                            <select
                                id='parentDomainId'
                                name='parentDomainId'
                                value={formData.parentDomainId}
                                onChange={handleChange}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                            >
                                <option value=''>
                                    Select parent domain (optional)
                                </option>
                                {parentDomains
                                    .filter(
                                        (domain) =>
                                            !isEditing ||
                                            domain.id !== parseInt(id)
                                    )
                                    .map((domain) => (
                                        <option
                                            key={domain.id}
                                            value={domain.id}
                                        >
                                            {domain.name}
                                        </option>
                                    ))}
                            </select>
                            <p className='mt-1 text-sm text-gray-500'>
                                Leave empty to create a root domain
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center justify-between'>
                            <Link
                                to='/admin/domains'
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
                                    ? "Update Domain"
                                    : "Create Domain"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DomainForm;
