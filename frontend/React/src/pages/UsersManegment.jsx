import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../utils/appConfig";
import { useAuth } from "../context/AuthContext";

const UsersPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [validRoles, setValidRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [roleChangeLoading, setRoleChangeLoading] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersResponse, rolesResponse] = await Promise.all([
                apiClient.get("/api/users"),
                apiClient.get("/api/users/roles"),
            ]);

            setUsers(usersResponse.data);
            setValidRoles(rolesResponse.data);
            setError(null);
        } catch (error) {
            if (error.response?.status === 403) {
                setError(
                    "Access denied. You don't have permission to view users."
                );
            } else {
                setError("Failed to fetch users");
            }
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, userName) => {
        // Prevent admin from deleting themselves
        if (currentUser && id === currentUser.id) {
            setError(
                "You cannot delete your own account for security reasons."
            );
            return;
        }

        if (
            !window.confirm(
                `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            setDeleteLoading(id);
            await apiClient.delete(`/api/users/${id}`);

            // Remove the deleted user from state
            setUsers(users.filter((user) => user.id !== id));
        } catch (error) {
            if (error.response?.status === 403) {
                setError(
                    "Access denied. You don't have permission to delete this user."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                        error.response?.data ||
                        "Failed to delete user"
                );
            }
            console.error("Error deleting user:", error);
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        // Prevent admin from changing their own role
        if (currentUser && userId === currentUser.id) {
            setError("You cannot change your own role for security reasons.");
            return;
        }

        try {
            setRoleChangeLoading(userId);
            const response = await apiClient.put(`/api/users/${userId}/role`, {
                role: newRole,
            });

            // Update the user in state
            setUsers(
                users.map((user) =>
                    user.id === userId
                        ? { ...user, role: response.data.role }
                        : user
                )
            );
        } catch (error) {
            if (error.response?.status === 403) {
                setError(
                    "Access denied. You don't have permission to change user roles."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                        error.response?.data ||
                        "Failed to change user role"
                );
            }
            console.error("Error changing user role:", error);
        } finally {
            setRoleChangeLoading(null);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-100 text-red-800";
            case "ONBOARDING":
                return "bg-blue-100 text-blue-800";
            case "USER":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
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
                            User Management
                        </h1>
                        <p className='mt-2 text-gray-600'>
                            Manage users and their roles. Admins can delete
                            users, change roles, but only edit their own
                            profile.
                        </p>
                    </div>
                    <Link
                        to='/admin/users/new'
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
                        Add User
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

                {/* Users Table */}
                <div className='bg-white shadow overflow-hidden sm:rounded-md'>
                    {users.length === 0 ? (
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
                                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                                />
                            </svg>
                            <h3 className='mt-2 text-sm font-medium text-gray-900'>
                                No users found
                            </h3>
                            <p className='mt-1 text-sm text-gray-500'>
                                Get started by creating a new user.
                            </p>
                            <div className='mt-6'>
                                <Link
                                    to='/admin/users/new'
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
                                    New User
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='min-w-full divide-y divide-gray-200'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            User
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Role
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            ID
                                        </th>
                                        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-gray-200'>
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className='hover:bg-gray-50'
                                        >
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='flex items-center'>
                                                    <div className='h-10 w-10 flex-shrink-0'>
                                                        <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                                                            <span className='text-sm font-medium text-gray-700'>
                                                                {user.name
                                                                    ?.charAt(0)
                                                                    .toUpperCase() ||
                                                                    "U"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className='ml-4'>
                                                        <div className='text-sm font-medium text-gray-900'>
                                                            {user.name}
                                                        </div>
                                                        <div className='text-sm text-gray-500'>
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <select
                                                    value={user.role}
                                                    onChange={(e) =>
                                                        handleRoleChange(
                                                            user.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={
                                                        roleChangeLoading ===
                                                            user.id ||
                                                        (currentUser &&
                                                            user.id ===
                                                                currentUser.id)
                                                    }
                                                    title={
                                                        currentUser &&
                                                        user.id ===
                                                            currentUser.id
                                                            ? "You cannot change your own role"
                                                            : undefined
                                                    }
                                                    className={`text-xs font-medium px-2 py-1 rounded-full border ${getRoleBadgeColor(
                                                        user.role
                                                    )} ${
                                                        roleChangeLoading ===
                                                            user.id ||
                                                        (currentUser &&
                                                            user.id ===
                                                                currentUser.id)
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : "cursor-pointer hover:bg-opacity-80"
                                                    }`}
                                                >
                                                    {validRoles.map((role) => (
                                                        <option
                                                            key={role}
                                                            value={role}
                                                        >
                                                            {role}
                                                        </option>
                                                    ))}
                                                </select>
                                                {roleChangeLoading ===
                                                    user.id && (
                                                    <div className='text-xs text-gray-500 mt-1'>
                                                        Updating...
                                                    </div>
                                                )}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                                #{user.id}
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                                                {/* Only show Edit button for current user (self-editing only) */}
                                                {currentUser &&
                                                user.id === currentUser.id ? (
                                                    <Link
                                                        to={`/admin/users/edit/${user.id}`}
                                                        className='text-green-600 hover:text-green-900'
                                                        title='Edit your profile'
                                                    >
                                                        Edit Profile
                                                    </Link>
                                                ) : (
                                                    <span
                                                        className='text-gray-400 cursor-not-allowed'
                                                        title='Admins can only edit their own profile'
                                                    >
                                                        Edit Profile
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            user.id,
                                                            user.name
                                                        )
                                                    }
                                                    disabled={
                                                        deleteLoading ===
                                                            user.id ||
                                                        (currentUser &&
                                                            user.id ===
                                                                currentUser.id)
                                                    }
                                                    className={`${
                                                        deleteLoading ===
                                                            user.id ||
                                                        (currentUser &&
                                                            user.id ===
                                                                currentUser.id)
                                                            ? "text-gray-400 cursor-not-allowed"
                                                            : "text-red-600 hover:text-red-900"
                                                    }`}
                                                    title={
                                                        currentUser &&
                                                        user.id ===
                                                            currentUser.id
                                                            ? "You cannot delete your own account"
                                                            : undefined
                                                    }
                                                >
                                                    {deleteLoading === user.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {users.length > 0 && (
                    <div className='mt-6 bg-white px-4 py-3 sm:px-6 rounded-lg shadow'>
                        <div className='text-sm text-gray-700'>
                            Showing{" "}
                            <span className='font-medium'>{users.length}</span>{" "}
                            user{users.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersPage;
