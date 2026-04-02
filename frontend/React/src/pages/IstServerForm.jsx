import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiClient } from "../utils/appConfig";

const IstServerForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        name: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoading, setInitialLoading] = useState(isEditing);

    useEffect(() => {
        if (isEditing) {
            fetchServer();
        }
    }, [id, isEditing]);

    const fetchServer = async () => {
        try {
            const response = await apiClient.get(`/api/ist-server/${id}`);
            setFormData({ name: response.data.name });
            setError(null);
        } catch (error) {
            setError("Failed to fetch IST server details");
            console.error("Error fetching server:", error);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing) {
                await apiClient.put(`/api/ist-server/${id}`, formData);
            } else {
                await apiClient.post("/api/ist-server", formData);
            }

            navigate("/admin/ist-servers");
        } catch (error) {
            if (error.response?.status === 403) {
                setError(
                    "Access denied. You don't have permission to perform this action."
                );
            } else {
                setError(
                    error.response?.data ||
                        `Failed to ${
                            isEditing ? "update" : "create"
                        } IST server`
                );
            }
            console.error("Error saving server:", error);
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
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-100 py-8'>
            <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-8'>
                    <Link
                        to='/admin/ist-servers'
                        className='text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center'
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
                        Back to IST Servers
                    </Link>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        {isEditing
                            ? "Edit IST Server"
                            : "Create New IST Server"}
                    </h1>
                    <p className='mt-2 text-gray-600'>
                        {isEditing
                            ? "Update the IST server information"
                            : "Add a new IST server to the system"}
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

                        {/* Server Name */}
                        <div className='mb-6'>
                            <label
                                htmlFor='name'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Server Name *
                            </label>
                            <input
                                type='text'
                                id='name'
                                name='name'
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                                placeholder='Enter IST server name'
                                disabled={loading}
                            />
                            <p className='mt-1 text-sm text-gray-500'>
                                Provide a unique name for the IST server
                            </p>
                        </div>

                        {/* Form Actions */}
                        <div className='flex items-center justify-end space-x-4 pt-6 border-t border-gray-200'>
                            <Link
                                to='/admin/ist-servers'
                                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            >
                                Cancel
                            </Link>
                            <button
                                type='submit'
                                disabled={loading || !formData.name.trim()}
                                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {loading ? (
                                    <div className='flex items-center'>
                                        <svg
                                            className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                                            xmlns='http://www.w3.org/2000/svg'
                                            fill='none'
                                            viewBox='0 0 24 24'
                                        >
                                            <circle
                                                className='opacity-25'
                                                cx='12'
                                                cy='12'
                                                r='10'
                                                stroke='currentColor'
                                                strokeWidth='4'
                                            ></circle>
                                            <path
                                                className='opacity-75'
                                                fill='currentColor'
                                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                            ></path>
                                        </svg>
                                        {isEditing
                                            ? "Updating..."
                                            : "Creating..."}
                                    </div>
                                ) : isEditing ? (
                                    "Update Server"
                                ) : (
                                    "Create Server"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default IstServerForm;
