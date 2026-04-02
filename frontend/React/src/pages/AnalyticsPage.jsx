import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { handleSuccess, handleError } from "../utils/toastAlerts";

const AnalyticsPage = () => {
    const { user, token, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [userAnalytics, setUserAnalytics] = useState(null);
    const [systemAnalytics, setSystemAnalytics] = useState(null);
    const [projectStats, setProjectStats] = useState(null);
    const [contactStats, setContactStats] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");

    const isAdminOrOnboarding =
        user?.role === "ADMIN" || user?.role === "ONBOARDING";

    useEffect(() => {
        if (!authLoading) {
            if (user && token) {
                fetchAnalytics();
            } else {
                setLoading(false);
            }
        }
    }, [user, token, authLoading]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            // Check if user is authenticated and token exists
            if (!user || !token) {
                console.log("User not authenticated, skipping analytics fetch");
                setLoading(false);
                return;
            }

            console.log(
                "User authenticated:",
                user.email,
                "Token exists:",
                !!token
            );

            // Initialize with default values
            setProjectStats({
                totalProjects: 0,
                activeProjects: 0,
                projectsThisMonth: 0,
                projectsThisWeek: 0,
                avgProjectsPerUser: "0",
            });

            setContactStats({
                totalContacts: 0,
                contactsThisMonth: 0,
                contactsThisWeek: 0,
                avgContactsPerUser: "0",
            });

            // Fetch user analytics
            console.log("Fetching user analytics...");
            try {
                const userResponse = await fetch(
                    "http://localhost:8080/api/analytics/user",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                console.log(
                    "User analytics response status:",
                    userResponse.status
                );
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    console.log("User analytics data:", userData);
                    setUserAnalytics(userData);
                } else {
                    const errorText = await userResponse.text();
                    console.error(
                        "User analytics error:",
                        userResponse.status,
                        errorText
                    );
                }
            } catch (userError) {
                console.error("Error fetching user analytics:", userError);
            }

            // Fetch project stats
            console.log("Fetching project stats...");
            try {
                const projectResponse = await fetch(
                    "http://localhost:8080/api/analytics/projects/stats",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                console.log(
                    "Project stats response status:",
                    projectResponse.status
                );
                if (projectResponse.ok) {
                    const projectData = await projectResponse.json();
                    console.log("Project stats data:", projectData);
                    setProjectStats(projectData);
                } else {
                    const errorText = await projectResponse.text();
                    console.error(
                        "Project stats error:",
                        projectResponse.status,
                        errorText
                    );
                }
            } catch (projectError) {
                console.error("Error fetching project stats:", projectError);
            }

            // Fetch contact stats
            console.log("Fetching contact stats...");
            try {
                const contactResponse = await fetch(
                    "http://localhost:8080/api/analytics/contacts/stats",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                console.log(
                    "Contact stats response status:",
                    contactResponse.status
                );
                if (contactResponse.ok) {
                    const contactData = await contactResponse.json();
                    console.log("Contact stats data:", contactData);
                    setContactStats(contactData);
                } else {
                    const errorText = await contactResponse.text();
                    console.error(
                        "Contact stats error:",
                        contactResponse.status,
                        errorText
                    );
                }
            } catch (contactError) {
                console.error("Error fetching contact stats:", contactError);
            }

            // Fetch system analytics if admin/onboarding
            if (isAdminOrOnboarding) {
                console.log("Fetching system analytics...");
                try {
                    const systemResponse = await fetch(
                        "http://localhost:8080/api/analytics/system",
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    console.log(
                        "System analytics response status:",
                        systemResponse.status
                    );
                    if (systemResponse.ok) {
                        const systemData = await systemResponse.json();
                        console.log("System analytics data:", systemData);
                        setSystemAnalytics(systemData);
                    } else {
                        const errorText = await systemResponse.text();
                        console.error(
                            "System analytics error:",
                            systemResponse.status,
                            errorText
                        );
                    }
                } catch (systemError) {
                    console.error(
                        "Error fetching system analytics:",
                        systemError
                    );
                }
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
            // Don't show error to user if it's just authentication related
            if (!user || !token) {
                console.log(
                    "Error was due to missing authentication, ignoring"
                );
            } else {
                handleError(
                    "An unexpected error occurred. Please try again or contact support if the problem persists."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, subtitle, icon, color = "blue" }) => (
        <div
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}
        >
            <div className='flex items-center justify-between'>
                <div>
                    <p className='text-gray-600 text-sm font-medium'>{title}</p>
                    <p className={`text-2xl font-bold text-${color}-600`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className='text-gray-500 text-xs mt-1'>{subtitle}</p>
                    )}
                </div>
                <div className={`text-${color}-500 text-3xl`}>{icon}</div>
            </div>
        </div>
    );

    const UsageCard = ({ title, items, type }) => (
        <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                {title}
            </h3>
            {items && items.length > 0 ? (
                <div className='space-y-3'>
                    {items.slice(0, 5).map((item, index) => (
                        <div
                            key={index}
                            className='flex items-center justify-between p-3 bg-gray-50 rounded'
                        >
                            <div>
                                <p className='font-medium text-gray-800'>
                                    {type === "domain"
                                        ? item.domainName
                                        : type === "version"
                                        ? `${item.domainName} v${item.versionNumber}`
                                        : item.serviceName}
                                </p>
                                {item.description && (
                                    <p className='text-sm text-gray-600'>
                                        {item.description}
                                    </p>
                                )}
                            </div>
                            <div className='text-right'>
                                <p className='font-bold text-blue-600'>
                                    {item.usageCount || item.projectCount}
                                </p>
                                <p className='text-xs text-gray-500'>uses</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className='text-gray-500 text-center py-4'>
                    No data available
                </p>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    // Check if user is authenticated
    if (!user || !token) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                        Authentication Required
                    </h2>
                    <p className='text-gray-600 mb-4'>
                        Please log in to view analytics data.
                    </p>
                    <a
                        href='/login'
                        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        Analytics Dashboard
                    </h1>
                    <p className='text-gray-600 mt-2'>
                        {isAdminOrOnboarding
                            ? "System-wide analytics and usage statistics"
                            : "Your personal usage statistics and analytics"}
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className='mb-6'>
                    <nav className='flex space-x-8'>
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "overview"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("usage")}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === "usage"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Usage Analytics
                        </button>
                        {isAdminOrOnboarding && (
                            <button
                                onClick={() => setActiveTab("system")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "system"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                System Analytics
                            </button>
                        )}
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className='space-y-6'>
                        {/* Quick Stats */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                            <StatCard
                                title='Total Projects'
                                value={projectStats?.totalProjects || 0}
                                subtitle='All your projects'
                                icon='📊'
                                color='blue'
                            />
                            <StatCard
                                title='Total Contacts'
                                value={contactStats?.totalContacts || 0}
                                subtitle='All your contacts'
                                icon='👥'
                                color='green'
                            />
                            <StatCard
                                title='This Month'
                                value={projectStats?.projectsThisMonth || 0}
                                subtitle='New projects'
                                icon='📈'
                                color='purple'
                            />
                            <StatCard
                                title='This Week'
                                value={projectStats?.projectsThisWeek || 0}
                                subtitle='Recent activity'
                                icon='⚡'
                                color='yellow'
                            />
                        </div>

                        {/* User Info Card */}
                        {userAnalytics && (
                            <div className='bg-white rounded-lg shadow-md p-6'>
                                <h2 className='text-xl font-semibold text-gray-800 mb-4'>
                                    Your Profile
                                </h2>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                    <div>
                                        <p className='text-sm text-gray-600'>
                                            Name
                                        </p>
                                        <p className='font-medium'>
                                            {userAnalytics.userName}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-sm text-gray-600'>
                                            Role
                                        </p>
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                userAnalytics.userRole ===
                                                "ADMIN"
                                                    ? "bg-red-100 text-red-800"
                                                    : userAnalytics.userRole ===
                                                      "ONBOARDING"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }`}
                                        >
                                            {userAnalytics.userRole}
                                        </span>
                                    </div>
                                    <div>
                                        <p className='text-sm text-gray-600'>
                                            Last Activity
                                        </p>
                                        <p className='font-medium'>
                                            {userAnalytics.lastActivity}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Usage Analytics Tab */}
                {activeTab === "usage" && (
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        <UsageCard
                            title='Most Used Domains'
                            items={userAnalytics?.topDomains || []}
                            type='domain'
                        />
                        <UsageCard
                            title='Most Used Versions'
                            items={userAnalytics?.topVersions || []}
                            type='version'
                        />
                        <UsageCard
                            title='Most Used Services'
                            items={userAnalytics?.topServices || []}
                            type='service'
                        />
                    </div>
                )}

                {/* System Analytics Tab (Admin/Onboarding only) */}
                {activeTab === "system" &&
                    isAdminOrOnboarding &&
                    systemAnalytics && (
                        <div className='space-y-6'>
                            {/* System Overview */}
                            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                                <StatCard
                                    title='Total Users'
                                    value={systemAnalytics.totalUsers}
                                    icon='👤'
                                    color='blue'
                                />
                                <StatCard
                                    title='Total Projects'
                                    value={systemAnalytics.totalProjects}
                                    icon='📊'
                                    color='green'
                                />
                                <StatCard
                                    title='Total Contacts'
                                    value={systemAnalytics.totalContacts}
                                    icon='👥'
                                    color='purple'
                                />
                                <StatCard
                                    title='Total Domains'
                                    value={systemAnalytics.totalDomains}
                                    icon='🌐'
                                    color='indigo'
                                />
                                <StatCard
                                    title='Total Versions'
                                    value={systemAnalytics.totalVersions}
                                    icon='🔄'
                                    color='pink'
                                />
                                <StatCard
                                    title='Total Services'
                                    value={systemAnalytics.totalServices}
                                    icon='⚙️'
                                    color='orange'
                                />
                            </div>

                            {/* Top Users */}
                            <div className='bg-white rounded-lg shadow-md p-6'>
                                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                                    Top Users by Project Count
                                </h3>
                                {systemAnalytics.topUsers &&
                                systemAnalytics.topUsers.length > 0 ? (
                                    <div className='space-y-3'>
                                        {systemAnalytics.topUsers
                                            .slice(0, 5)
                                            .map((user, index) => (
                                                <div
                                                    key={user.userId}
                                                    className='flex items-center justify-between p-3 bg-gray-50 rounded'
                                                >
                                                    <div className='flex items-center space-x-3'>
                                                        <span
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                                                index === 0
                                                                    ? "bg-yellow-500"
                                                                    : index ===
                                                                      1
                                                                    ? "bg-gray-400"
                                                                    : index ===
                                                                      2
                                                                    ? "bg-yellow-600"
                                                                    : "bg-blue-500"
                                                            }`}
                                                        >
                                                            {index + 1}
                                                        </span>
                                                        <div>
                                                            <p className='font-medium text-gray-800'>
                                                                {user.userName}
                                                            </p>
                                                            <p className='text-sm text-gray-600'>
                                                                {user.userEmail}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className='text-right'>
                                                        <p className='font-bold text-blue-600'>
                                                            {user.totalProjects}
                                                        </p>
                                                        <p className='text-xs text-gray-500'>
                                                            projects
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className='text-gray-500 text-center py-4'>
                                        No user data available
                                    </p>
                                )}
                            </div>

                            {/* System Usage */}
                            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                                <UsageCard
                                    title='Most Used Domains (System)'
                                    items={
                                        systemAnalytics.mostUsedDomains || []
                                    }
                                    type='domain'
                                />
                                <UsageCard
                                    title='Most Used Versions (System)'
                                    items={
                                        systemAnalytics.mostUsedVersions || []
                                    }
                                    type='version'
                                />
                                <UsageCard
                                    title='Most Used Services (System)'
                                    items={
                                        systemAnalytics.mostUsedServices || []
                                    }
                                    type='service'
                                />
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default AnalyticsPage;
