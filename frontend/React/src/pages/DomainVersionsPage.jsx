import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../utils/appConfig";

const DomainVersionsPage = () => {
    const [domainVersions, setDomainVersions] = useState([]);
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteModal, setDeleteModal] = useState({
        show: false,
        domainVersion: null,
    });

    useEffect(() => {
        fetchDomains();
        fetchDomainVersions();
    }, []);

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
            setError(null);
        } catch (error) {
            setError("Failed to fetch domain versions");
            console.error("Error fetching domain versions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/api/domain-version/${id}`);
            setDomainVersions(domainVersions.filter((dv) => dv.id !== id));
            setDeleteModal({ show: false, domainVersion: null });
        } catch (error) {
            setError("Failed to delete domain version");
            console.error("Error deleting domain version:", error);
        }
    };

    const openDeleteModal = (domainVersion) => {
        setDeleteModal({ show: true, domainVersion });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, domainVersion: null });
    };

    const getDomainName = (domainId) => {
        const domain = domains.find((d) => d.id === domainId);
        return domain ? domain.name : `Domain ${domainId}`;
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500'></div>
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
                                className='text-indigo-600 hover:text-indigo-800 mb-2 inline-flex items-center'
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
                                Domain Versions
                            </h1>
                            <p className='mt-2 text-gray-600'>
                                Manage domain versions and their configurations
                            </p>
                        </div>
                        <Link
                            to='/admin/domain-versions/create'
                            className='bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-flex items-center'
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
                            Add New Version
                        </Link>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className='mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
                        {error}
                    </div>
                )}

                {/* Domain Versions Table */}
                <div className='bg-white shadow-sm rounded-lg overflow-hidden'>
                    {domainVersions.length === 0 ? (
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
                                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                />
                            </svg>
                            <h3 className='mt-2 text-sm font-medium text-gray-900'>
                                No domain versions
                            </h3>
                            <p className='mt-1 text-sm text-gray-500'>
                                Get started by creating a new domain version.
                            </p>
                            <div className='mt-6'>
                                <Link
                                    to='/admin/domain-versions/create'
                                    className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700'
                                >
                                    <svg
                                        className='-ml-1 mr-2 h-5 w-5'
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
                                    New Domain Version
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='min-w-full divide-y divide-gray-200'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            ID
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Domain
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Version
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Created Date
                                        </th>
                                        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-gray-200'>
                                    {domainVersions.map((domainVersion) => (
                                        <tr
                                            key={domainVersion.id}
                                            className='hover:bg-gray-50'
                                        >
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                                                {domainVersion.id}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                {getDomainName(
                                                    domainVersion.domainId
                                                )}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800'>
                                                    v{domainVersion.version}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                {domainVersion.createdDate
                                                    ? new Date(
                                                          domainVersion.createdDate
                                                      ).toLocaleDateString()
                                                    : "N/A"}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                                                <Link
                                                    to={`/admin/domain-versions/edit/${domainVersion.id}`}
                                                    className='text-indigo-600 hover:text-indigo-900 mr-4'
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        openDeleteModal(
                                                            domainVersion
                                                        )
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
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteModal.show && (
                    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
                        <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
                            <div className='mt-3 text-center'>
                                <h3 className='text-lg font-medium text-gray-900'>
                                    Delete Domain Version
                                </h3>
                                <div className='mt-2 px-7 py-3'>
                                    <p className='text-sm text-gray-500'>
                                        Are you sure you want to delete version
                                        "{deleteModal.domainVersion?.version}"
                                        for{" "}
                                        {getDomainName(
                                            deleteModal.domainVersion?.domainId
                                        )}
                                        ? This action cannot be undone.
                                    </p>
                                </div>
                                <div className='flex justify-center space-x-4 px-4 py-3'>
                                    <button
                                        onClick={closeDeleteModal}
                                        className='px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                deleteModal.domainVersion.id
                                            )
                                        }
                                        className='px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700'
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DomainVersionsPage;
