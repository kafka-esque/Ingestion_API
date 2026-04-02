import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../utils/appConfig";
import { handleSuccess, handleError } from "../utils/toastAlerts";

const ContactPage = () => {
    const { user, isAdmin, canManageServices } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({
        emailName: "",
        emailId: "",
        contactType: "BUSINESS",
    });
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Contact types for dropdown
    const contactTypes = ["BUSINESS", "PERSONAL", "SUPPORT", "OTHER"];

    useEffect(() => {
        fetchContacts();
        if (canManageServices()) {
            fetchAllUsers();
        }
    }, [canManageServices]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            let response;

            if (canManageServices()) {
                // Admin/Onboarding can see all contacts
                response = await apiClient.get("/api/contacts");
            } else {
                // Regular users see only their own contacts
                response = await apiClient.get("/api/contacts/my");
            }

            setContacts(response.data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
            handleError("Failed to fetch contacts");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const response = await apiClient.get("/api/users");
            setAllUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchContactsByUser = async (userId) => {
        try {
            setLoading(true);
            const response = await apiClient.get(
                `/api/contacts/user/${userId}`
            );
            setContacts(response.data);
        } catch (error) {
            console.error("Error fetching user contacts:", error);
            handleError("Failed to fetch user contacts");
        } finally {
            setLoading(false);
        }
    };

    const handleUserFilter = (userId) => {
        setSelectedUserId(userId);
        if (userId === "all") {
            fetchContacts();
        } else if (userId) {
            fetchContactsByUser(userId);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingContact) {
                // Update existing contact
                await apiClient.put(
                    `/api/contacts/${editingContact.id}`,
                    formData
                );
                handleSuccess("Contact updated successfully");
            } else {
                // Create new contact
                if (
                    canManageServices() &&
                    selectedUserId &&
                    selectedUserId !== "all"
                ) {
                    // Admin creating contact for specific user
                    await apiClient.post(
                        `/api/contacts/user/${selectedUserId}`,
                        formData
                    );
                } else {
                    // Regular user or admin creating for themselves
                    await apiClient.post("/api/contacts", formData);
                }
                handleSuccess("Contact created successfully");
            }

            setShowForm(false);
            setEditingContact(null);
            setFormData({
                emailName: "",
                emailId: "",
                contactType: "BUSINESS",
            });

            // Refresh the contacts list
            if (selectedUserId && selectedUserId !== "all") {
                fetchContactsByUser(selectedUserId);
            } else {
                fetchContacts();
            }
        } catch (error) {
            console.error("Error saving contact:", error);
            if (error.response?.status === 409) {
                handleError(
                    "A contact with this email already exists for this user"
                );
            } else {
                handleError("Failed to save contact");
            }
        }
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setFormData({
            emailName: contact.emailName,
            emailId: contact.emailId,
            contactType: contact.contactType,
        });
        setShowForm(true);
    };

    const handleDelete = async (contactId) => {
        if (window.confirm("Are you sure you want to delete this contact?")) {
            try {
                await apiClient.delete(`/api/contacts/${contactId}`);
                handleSuccess("Contact deleted successfully");

                // Refresh the contacts list
                if (selectedUserId && selectedUserId !== "all") {
                    fetchContactsByUser(selectedUserId);
                } else {
                    fetchContacts();
                }
            } catch (error) {
                console.error("Error deleting contact:", error);
                handleError("Failed to delete contact");
            }
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingContact(null);
        setFormData({ emailName: "", emailId: "", contactType: "BUSINESS" });
    };

    const getUserNameById = (userId) => {
        const user = allUsers.find((u) => u.id === userId);
        return user
            ? `${user.firstName} ${user.lastName} (${user.email})`
            : "Unknown User";
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            <div className='bg-white shadow-lg rounded-lg'>
                {/* Header */}
                <div className='px-6 py-4 border-b border-gray-200'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-900'>
                                {canManageServices()
                                    ? "Contact Management"
                                    : "My Contacts"}
                            </h1>
                            <p className='text-gray-600 mt-1'>
                                {canManageServices()
                                    ? "Manage contacts for all users"
                                    : "Manage your personal contacts"}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors'
                        >
                            <svg
                                className='w-5 h-5'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M12 4v16m8-8H4'
                                />
                            </svg>
                            Add Contact
                        </button>
                    </div>
                </div>

                {/* User Filter (Admin Only) */}
                {canManageServices() && (
                    <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
                        <div className='flex items-center gap-4'>
                            <label className='text-sm font-medium text-gray-700'>
                                Filter by User:
                            </label>
                            <select
                                value={selectedUserId || "all"}
                                onChange={(e) =>
                                    handleUserFilter(e.target.value)
                                }
                                className='border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                            >
                                <option value='all'>All Users</option>
                                {allUsers.map((user) => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.firstName} {user.lastName} (
                                        {user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Contact Form Modal */}
                {showForm && (
                    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
                        <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
                            <div className='mt-3'>
                                <h3 className='text-lg font-bold text-gray-900 mb-4'>
                                    {editingContact
                                        ? "Edit Contact"
                                        : "Add New Contact"}
                                </h3>
                                <form
                                    onSubmit={handleSubmit}
                                    className='space-y-4'
                                >
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Contact Name
                                        </label>
                                        <input
                                            type='text'
                                            value={formData.emailName}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    emailName: e.target.value,
                                                })
                                            }
                                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Email Address
                                        </label>
                                        <input
                                            type='email'
                                            value={formData.emailId}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    emailId: e.target.value,
                                                })
                                            }
                                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Contact Type
                                        </label>
                                        <select
                                            value={formData.contactType}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    contactType: e.target.value,
                                                })
                                            }
                                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        >
                                            {contactTypes.map((type) => (
                                                <option
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='flex justify-end gap-2 pt-4'>
                                        <button
                                            type='button'
                                            onClick={resetForm}
                                            className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50'
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type='submit'
                                            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                                        >
                                            {editingContact
                                                ? "Update"
                                                : "Create"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contacts List */}
                <div className='p-6'>
                    {contacts.length === 0 ? (
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
                            <h3 className='mt-4 text-lg font-medium text-gray-900'>
                                No contacts found
                            </h3>
                            <p className='mt-2 text-gray-500'>
                                Get started by creating your first contact.
                            </p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='min-w-full divide-y divide-gray-200'>
                                <thead className='bg-gray-50'>
                                    <tr>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Contact Name
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Email
                                        </th>
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Type
                                        </th>
                                        {canManageServices() && (
                                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                                Owner
                                            </th>
                                        )}
                                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-gray-200'>
                                    {contacts.map((contact) => (
                                        <tr
                                            key={contact.id}
                                            className='hover:bg-gray-50'
                                        >
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='text-sm font-medium text-gray-900'>
                                                    {contact.emailName}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='text-sm text-gray-900'>
                                                    {contact.emailId}
                                                </div>
                                            </td>
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        contact.contactType ===
                                                        "BUSINESS"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : contact.contactType ===
                                                              "PERSONAL"
                                                            ? "bg-green-100 text-green-800"
                                                            : contact.contactType ===
                                                              "SUPPORT"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                >
                                                    {contact.contactType}
                                                </span>
                                            </td>
                                            {canManageServices() && (
                                                <td className='px-6 py-4 whitespace-nowrap'>
                                                    <div className='text-sm text-gray-900'>
                                                        {getUserNameById(
                                                            contact.userId
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                                <div className='flex space-x-2'>
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(contact)
                                                        }
                                                        className='text-blue-600 hover:text-blue-900'
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                contact.id
                                                            )
                                                        }
                                                        className='text-red-600 hover:text-red-900'
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
