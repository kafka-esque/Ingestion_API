import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiClient } from "../utils/appConfig";
import { useAuth } from "../context/AuthContext";

const UserForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const { user: currentUser } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER",
    });
    const [validRoles, setValidRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialLoading, setInitialLoading] = useState(isEditing);

    // Check if the current user is editing their own profile
    const isEditingSelf =
        isEditing && currentUser && parseInt(id) === currentUser.id;

    useEffect(() => {
        fetchValidRoles();
        if (isEditing) {
            fetchUser();
        }
    }, [id, isEditing]);

    const fetchValidRoles = async () => {
        try {
            const response = await apiClient.get("/api/users/roles");
            setValidRoles(response.data);
        } catch (error) {
            console.error("Error fetching valid roles:", error);
            // Set default roles if API fails
            setValidRoles(["USER", "ADMIN", "ONBOARDING"]);
        }
    };

    const fetchUser = async () => {
        try {
            const response = await apiClient.get(`/api/users/${id}`);
            setFormData({
                name: response.data.name || "",
                email: response.data.email || "",
                password: "", // Never populate password for security
                confirmPassword: "",
                role: response.data.role || "USER",
            });
            setError(null);
        } catch (error) {
            setError("Failed to fetch user details");
            console.error("Error fetching user:", error);
        } finally {
            setInitialLoading(false);
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Name is required");
            return false;
        }
        if (!formData.email.trim()) {
            setError("Email is required");
            return false;
        }
        if (!isEditing && !formData.password) {
            setError("Password is required for new users");
            return false;
        }
        if (
            formData.password &&
            formData.password !== formData.confirmPassword
        ) {
            setError("Passwords do not match");
            return false;
        }
        if (formData.password && formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                role: formData.role,
            };

            // Only include password if it's provided
            if (formData.password) {
                payload.password = formData.password;
            }

            if (isEditing) {
                // Prevent admin from changing their own role
                if (isEditingSelf) {
                    delete payload.role; // Exclude role from update
                }
                await apiClient.put(`/api/users/${id}`, payload);
            } else {
                await apiClient.post("/api/users", payload);
            }

            navigate("/admin/users");
        } catch (error) {
            if (error.response?.status === 403) {
                setError(
                    "Access denied. You don't have permission to perform this action."
                );
            } else if (error.response?.status === 409) {
                setError("A user with this email already exists.");
            } else {
                setError(
                    error.response?.data?.message ||
                        error.response?.data ||
                        `Failed to ${isEditing ? "update" : "create"} user`
                );
            }
            console.error("Error saving user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error when user starts typing
        if (error) {
            setError(null);
        }
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
                        to='/admin/users'
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
                        Back to Users
                    </Link>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        {isEditing ? "Edit User" : "Create New User"}
                    </h1>
                    <p className='mt-2 text-gray-600'>
                        {isEditing
                            ? "Update user information and role"
                            : "Add a new user to the system"}
                    </p>
                    {isEditingSelf && (
                        <div className='mt-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded'>
                            <div className='flex items-center'>
                                <svg
                                    className='h-5 w-5 mr-2'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                                <span className='font-medium'>
                                    Self-editing restrictions:
                                </span>
                            </div>
                            <p className='mt-1 text-sm'>
                                You are editing your own profile. Your role
                                cannot be changed for security reasons.
                            </p>
                        </div>
                    )}
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

                        {/* Name */}
                        <div className='mb-6'>
                            <label
                                htmlFor='name'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Full Name *
                            </label>
                            <input
                                type='text'
                                id='name'
                                name='name'
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                                placeholder='Enter full name'
                            />
                        </div>

                        {/* Email */}
                        <div className='mb-6'>
                            <label
                                htmlFor='email'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Email Address *
                            </label>
                            <input
                                type='email'
                                id='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                                placeholder='Enter email address'
                            />
                        </div>

                        {/* Role */}
                        <div className='mb-6'>
                            <label
                                htmlFor='role'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Role *
                            </label>
                            <select
                                id='role'
                                name='role'
                                value={formData.role}
                                onChange={handleChange}
                                required
                                disabled={isEditingSelf}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none ${
                                    isEditingSelf
                                        ? "bg-gray-100 cursor-not-allowed text-gray-500"
                                        : "focus:ring-green-500 focus:border-green-500"
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
                            <p className='mt-1 text-sm text-gray-500'>
                                {isEditingSelf
                                    ? "You cannot change your own role for security reasons"
                                    : "Select the appropriate role for this user"}
                            </p>
                        </div>

                        {/* Password */}
                        <div className='mb-6'>
                            <label
                                htmlFor='password'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Password{" "}
                                {isEditing
                                    ? "(leave blank to keep current)"
                                    : "*"}
                            </label>
                            <input
                                type='password'
                                id='password'
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                required={!isEditing}
                                minLength={6}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                                placeholder={
                                    isEditing
                                        ? "Enter new password (optional)"
                                        : "Enter password"
                                }
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className='mb-6'>
                            <label
                                htmlFor='confirmPassword'
                                className='block text-sm font-medium text-gray-700 mb-2'
                            >
                                Confirm Password{" "}
                                {isEditing ? "(if changing)" : "*"}
                            </label>
                            <input
                                type='password'
                                id='confirmPassword'
                                name='confirmPassword'
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required={!isEditing || formData.password}
                                minLength={6}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                                placeholder={
                                    isEditing
                                        ? "Confirm new password (if changing)"
                                        : "Confirm password"
                                }
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className='flex items-center justify-between'>
                            <Link
                                to='/admin/users'
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
                                    ? "Update User"
                                    : "Create User"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserForm;
