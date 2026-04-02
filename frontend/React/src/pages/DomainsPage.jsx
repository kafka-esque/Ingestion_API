import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../utils/appConfig";

const DomainsPage = () => {
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModal, setDeleteModal] = useState({
        show: false,
        domain: null,
    });

    useEffect(() => {
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        try {
            const response = await apiClient.get("/api/domain");
            setDomains(response.data);
            setError(null);
        } catch (error) {
            setError("Failed to fetch domains");
            console.error("Error fetching domains:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/api/domain/${id}`);
            setDomains(domains.filter((domain) => domain.id !== id));
            setDeleteModal({ show: false, domain: null });
        } catch (error) {
            setError("Failed to delete domain");
            console.error("Error deleting domain:", error);
        }
    };

    const openDeleteModal = (domain) => {
        setDeleteModal({ show: true, domain });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, domain: null });
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-100 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-8'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <Link
                                to='/admin/dashboard'
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
                                Back to Dashboard
                            </Link>
                            <h1 className='text-3xl font-bold text-gray-900'>
                                Domains
                            </h1>
                            <p className='mt-2 text-gray-600'>
                                Manage your domain configurations and
                                hierarchies
                            </p>
                        </div>
                        <Link
                            to='/admin/domains/create'
                            className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center'
                        >
                            <svg
                                className='h-5 w-5 mr-2'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                                />
                            </svg>
                            Add New Domain
                        </Link>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className='mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
                        {error}
                    </div>
                )}

                {/* Domains Table */}
                <div className='bg-white shadow-sm rounded-lg overflow-hidden'>
                    {domains.length === 0 ? (
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
                                    d='M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9m9 9c5 0 9-4 9-9m-9 9c0 5 4 9 9 9M12 3c0 5 4 9 9 9'
                                />
                            </svg>
                            <h3 className='mt-2 text-sm font-medium text-gray-900'>
                                No domains
                            </h3>
                            <p className='mt-1 text-sm text-gray-500'>
                                Get started by creating a new domain.
                            </p>
                            <div className='mt-6'>
                                <Link
                                    to='/admin/domains/create'
                                    className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700'
                                >
                                    <svg
                                        className='h-5 w-5 mr-2'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                                        />
                                    </svg>
                                    Add Domain
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <table className='min-w-full divide-y divide-gray-200'>
                            <thead className='bg-gray-50'>
                                <tr>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        ID
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Name
                                    </th>
                                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                                {domains.map((domain) => (
                                    <tr
                                        key={domain.id}
                                        className='hover:bg-gray-50'
                                    >
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                            {domain.id}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='text-sm font-medium text-gray-900'>
                                                {domain.name}
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                            <Link
                                                to={`/admin/domain-versions?domainId=${domain.id}`}
                                                className='text-purple-600 hover:text-purple-900 mr-4'
                                            >
                                                Versions
                                            </Link>
                                            <Link
                                                to={`/admin/domains/edit/${domain.id}`}
                                                className='text-blue-600 hover:text-blue-900 mr-4'
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    openDeleteModal(domain)
                                                }
                                                className='text-red-600 hover:text-red-900'
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
                    <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
                        <div className='mt-3 text-center'>
                            <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100'>
                                <svg
                                    className='h-6 w-6 text-red-600'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
                                    />
                                </svg>
                            </div>
                            <h3 className='text-lg font-medium text-gray-900 mt-4'>
                                Delete Domain
                            </h3>
                            <div className='mt-2 px-7 py-3'>
                                <p className='text-sm text-gray-500'>
                                    Are you sure you want to delete "
                                    {deleteModal.domain?.name}"? This action
                                    cannot be undone.
                                </p>
                            </div>
                            <div className='items-center px-4 py-3'>
                                <button
                                    onClick={() =>
                                        handleDelete(deleteModal.domain.id)
                                    }
                                    className='px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300'
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={closeDeleteModal}
                                    className='px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300'
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DomainsPage;
