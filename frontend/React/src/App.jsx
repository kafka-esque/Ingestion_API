import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/Login";
import Home from "./pages/Home";
import ProjectPage from "./pages/ProjectPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import NotFound from "./pages/NotFound";
import RefreshHandler from "./utils/RefreshHandler";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import { apiClient } from "./utils/appConfig";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ErrorProvider, useError } from "./context/ErrorContext";
import { AuthProvider } from "./context/AuthContext";
import AdminRoute from "./components/AdminRoute";
import ServicesDashboard from "./pages/ServicesDashboard";
import IstServersPage from "./pages/IstServersPage";
import IstServerForm from "./pages/IstServerForm";
import DomainsPage from "./pages/DomainsPage";
import DomainForm from "./pages/DomainForm";
import DomainVersionsPage from "./pages/DomainVersionsPage";
import DomainVersionForm from "./pages/DomainVersionForm";
import OperationServicesPage from "./pages/OperationServicesPage";
import OperationServiceForm from "./pages/OperationServiceForm";
import UsersPage from "./pages/UsersManegment";
import UserForm from "./pages/UserForm";
import Profile from "./pages/Profile";
import ProjectManagement from "./pages/ProjectManagement";
import ProjectEditPage from "./pages/ProjectEditPage";
import ContactPage from "./pages/ContactPage";
import AnalyticsPage from "./pages/AnalyticsPage";

// Component that handles server health checking within the ErrorProvider context
const ServerHealthChecker = () => {
    const { handleError } = useError();
    const [isServerUp, setIsServerUp] = useState(true);

    useEffect(() => {
        const checkServer = async () => {
            try {
                // Try to reach any public endpoint to check if server is up
                const response = await apiClient.get("/api/auth/health", {
                    timeout: 5000, // 5 second timeout
                });
                setIsServerUp(response.status === 200);
            } catch (error) {
                console.log("Server health check failed:", error.message);
                setIsServerUp(false);
            }
        };

        const intervalId = setInterval(checkServer, 30000); // Check every 30 seconds
        checkServer(); // Initial check

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (!isServerUp) {
            handleError(
                new Error(
                    "Backend server is not responding. Please check if the server is running on port 8080."
                )
            );
        }
    }, [isServerUp, handleError]);

    return null; // This component doesn't render anything
};

const App = () => {
    return (
        <AuthProvider>
            <ErrorProvider>
                <BrowserRouter>
                    <ServerHealthChecker />
                    <RefreshHandler />
                    <Navbar />
                    <Routes>
                        {/* Redirect root path ("/") to `/home` */}
                        <Route
                            path='/'
                            element={<Navigate to='/home' />}
                        />

                        {/* Signup page */}
                        <Route
                            path='/signup'
                            element={<SignUp />}
                        />

                        {/* Login page */}
                        <Route
                            path='/login'
                            element={<LogIn />}
                        />

                        {/* forgotPassword */}
                        <Route
                            path='/forgot-password'
                            element={<ForgotPassword />}
                        />

                        {/*reset password */}
                        <Route
                            path='/reset-password/:token'
                            element={<ResetPassword />}
                        />

                        {/* Home page (protected route) */}
                        <Route
                            path='/home'
                            element={<Home />}
                        />

                        {/* Projects page (protected route) */}
                        <Route
                            path='/projects'
                            element={<ProjectPage />}
                        />

                        {/* Create Project page (protected route) */}
                        <Route
                            path='/projects/create'
                            element={<CreateProjectPage />}
                        />

                        {/* Edit Project page (protected route) */}
                        <Route
                            path='/projects/:id/edit'
                            element={<ProjectEditPage />}
                        />

                        {/* Project Details page (protected route) */}
                        <Route
                            path='/projects/:projectId/details'
                            element={<ProjectDetailsPage />}
                        />

                        {/* Profile page (protected route) */}
                        <Route
                            path='/profile'
                            element={<Profile />}
                        />

                        {/* Contacts page (protected route) */}
                        <Route
                            path='/contacts'
                            element={<ContactPage />}
                        />

                        {/* Analytics page (protected route) */}
                        <Route
                            path='/analytics'
                            element={<AnalyticsPage />}
                        />

                        {/* Admin Routes - Protected by AdminRoute component */}
                        <Route
                            path='/admin'
                            element={
                                <AdminRoute>
                                    <ServicesDashboard />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/dashboard'
                            element={
                                <AdminRoute>
                                    <ServicesDashboard />
                                </AdminRoute>
                            }
                        />

                        {/* IST Server Routes */}
                        <Route
                            path='/admin/ist-servers'
                            element={
                                <AdminRoute>
                                    <IstServersPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/ist-servers/new'
                            element={
                                <AdminRoute>
                                    <IstServerForm />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/ist-servers/create'
                            element={
                                <AdminRoute>
                                    <IstServerForm />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/ist-servers/edit/:id'
                            element={
                                <AdminRoute>
                                    <IstServerForm />
                                </AdminRoute>
                            }
                        />

                        {/* Domain Routes */}
                        <Route
                            path='/admin/domains'
                            element={
                                <AdminRoute>
                                    <DomainsPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/domains/new'
                            element={
                                <AdminRoute>
                                    <DomainForm />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/domains/create'
                            element={
                                <AdminRoute>
                                    <DomainForm />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/domains/edit/:id'
                            element={
                                <AdminRoute>
                                    <DomainForm />
                                </AdminRoute>
                            }
                        />

                        {/* Domain Version Routes */}
                        <Route
                            path='/admin/domain-versions'
                            element={
                                <AdminRoute>
                                    <DomainVersionsPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/domain-versions/new'
                            element={
                                <AdminRoute>
                                    <DomainVersionForm />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/domain-versions/create'
                            element={
                                <AdminRoute>
                                    <DomainVersionForm />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/domain-versions/edit/:id'
                            element={
                                <AdminRoute>
                                    <DomainVersionForm />
                                </AdminRoute>
                            }
                        />

                        {/* Operation Service Routes */}
                        <Route
                            path='/admin/operation-services'
                            element={
                                <AdminRoute>
                                    <OperationServicesPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/operation-services/new'
                            element={
                                <AdminRoute>
                                    <OperationServiceForm />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/operation-services/create'
                            element={
                                <AdminRoute>
                                    <OperationServiceForm />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/operation-services/edit/:id'
                            element={
                                <AdminRoute>
                                    <OperationServiceForm />
                                </AdminRoute>
                            }
                        />

                        {/* Project Management Routes */}
                        <Route
                            path='/admin/projects'
                            element={
                                <AdminRoute>
                                    <ProjectManagement />
                                </AdminRoute>
                            }
                        />

                        {/* User Management Routes */}
                        <Route
                            path='/admin/users'
                            element={
                                <AdminRoute>
                                    <UsersPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/users/new'
                            element={
                                <AdminRoute>
                                    <UserForm />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/users/create'
                            element={
                                <AdminRoute>
                                    <UserForm />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path='/admin/users/edit/:id'
                            element={
                                <AdminRoute>
                                    <UserForm />
                                </AdminRoute>
                            }
                        />

                        {/* Catch-all route for undefined paths */}
                        <Route
                            path='*'
                            element={<NotFound />}
                        />
                    </Routes>
                </BrowserRouter>
            </ErrorProvider>
        </AuthProvider>
    );
};

export default App;
