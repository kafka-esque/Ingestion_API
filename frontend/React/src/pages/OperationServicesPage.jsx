import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../utils/appConfig";

const OperationServicesPage = () => {
    const [operationServices, setOperationServices] = useState([]);
    const [domains, setDomains] = useState([]);
    const [domainVersions, setDomainVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [servicesResponse, domainsResponse, versionsResponse] =
                await Promise.all([
                    apiClient.get("/api/operation-services"),
                    apiClient.get("/api/domain"),
                    apiClient.get("/api/domain-version"),
                ]);

            setOperationServices(servicesResponse.data);
            setDomains(domainsResponse.data);
            setDomainVersions(versionsResponse.data);
            setError(null);
        } catch (error) {
            setError("Failed to fetch operation services");
            console.error("Error fetching operation services:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, serviceName) => {
        if (
            !window.confirm(
                `Are you sure you want to delete the operation service "${serviceName}"?`
            )
        ) {
            return;
        }

        try {
            setDeleteLoading(id);
            await apiClient.delete(`/api/operation-services/${id}`);

            // Remove the deleted service from state
            setOperationServices(
                operationServices.filter((service) => service.id !== id)
            );
        } catch (error) {
            if (error.response?.status === 403) {
                setError(
                    "Access denied. You don't have permission to delete this operation service."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                        error.response?.data ||
                        "Failed to delete operation service"
                );
            }
            console.error("Error deleting operation service:", error);
        } finally {
            setDeleteLoading(null);
        }
    };

    const getDomainName = (domainId) => {
        const domain = domains.find((d) => d.id === domainId);
        return domain ? domain.name : `Domain ${domainId}`;
    };

    const getVersionName = (versionId) => {
        const version = domainVersions.find((v) => v.id === versionId);
        return version ? version.version : `Version ${versionId}`;
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-green-500'></div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-100 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='flex justify-between items-center mb-8'>
                    <div>
                        <Link
                            to='/admin'
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
                            Back to Admin Dashboard
                        </Link>
                        <h1 className='text-3xl font-bold text-gray-900'>
                            Operation Services
                        </h1>
                        <p className='mt-2 text-gray-600'>
                            Manage operation services for domains and versions
                        </p>
                    </div>
                    <Link
                        to='/admin/operation-services/new'
                        className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'
                    >
                        <svg
                            className='h-4 w-4 mr-2 inline'
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
                        Add Operation Service
                    </Link>
                </div>

                {/* Error Message */}
                {error && (
                    <div className='mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className='ml-2 text-red-700 hover:text-red-900'
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Operation Services Table */}
                <div className='bg-white shadow overflow-hidden sm:rounded-md'>
                    {operationServices.length === 0 ? (
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
                                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                                />
                            </svg>
                            <h3 className='mt-2 text-sm font-medium text-gray-900'>
                                No operation services
                            </h3>
                            <p className='mt-1 text-sm text-gray-500'>
                                Get started by creating a new operation service.
                            </p>
                            <div className='mt-6'>
                                <Link
                                    to='/admin/operation-services/new'
                                    className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
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
                                    New Operation Service
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <ul className='divide-y divide-gray-200'>
                            {operationServices.map((service) => (
                                <li
                                    key={service.id}
                                    className='px-6 py-4 hover:bg-gray-50'
                                >
                                    <div className='flex items-center justify-between'>
                                        <div className='flex-1'>
                                            <div className='flex items-center justify-between'>
                                                <div>
                                                    <p className='text-lg font-medium text-gray-900'>
                                                        {service.name}
                                                    </p>
                                                    <div className='mt-1 flex items-center space-x-4 text-sm text-gray-500'>
                                                        <span>
                                                            <span className='font-medium'>
                                                                Domain:
                                                            </span>{" "}
                                                            {getDomainName(
                                                                service.domainId
                                                            )}
                                                        </span>
                                                        <span>
                                                            <span className='font-medium'>
                                                                Version:
                                                            </span>{" "}
                                                            {getVersionName(
                                                                service.versionId
                                                            )}
                                                        </span>
                                                        <span>
                                                            <span className='font-medium'>
                                                                ID:
                                                            </span>{" "}
                                                            {service.id}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <Link
                                                        to={`/admin/operation-services/edit/${service.id}`}
                                                        className='text-green-600 hover:text-green-900 font-medium'
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                service.id,
                                                                service.name
                                                            )
                                                        }
                                                        disabled={
                                                            deleteLoading ===
                                                            service.id
                                                        }
                                                        className={`font-medium ${
                                                            deleteLoading ===
                                                            service.id
                                                                ? "text-gray-400 cursor-not-allowed"
                                                                : "text-red-600 hover:text-red-900"
                                                        }`}
                                                    >
                                                        {deleteLoading ===
                                                        service.id
                                                            ? "Deleting..."
                                                            : "Delete"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {operationServices.length > 0 && (
                    <div className='mt-6 bg-white px-4 py-3 sm:px-6 rounded-lg shadow'>
                        <div className='text-sm text-gray-700'>
                            Showing{" "}
                            <span className='font-medium'>
                                {operationServices.length}
                            </span>{" "}
                            operation service
                            {operationServices.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OperationServicesPage;
