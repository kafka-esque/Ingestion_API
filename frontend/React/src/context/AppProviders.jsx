import React from "react";
import { UserProvider, useUser } from "./UserContext";
import { ErrorProvider } from "./ErrorContext";

/**
 * Combined provider that wraps both UserProvider and ErrorProvider
 * This ensures proper provider hierarchy and context availability
 */
export const AppProviders = ({ children }) => {
    return (
        <UserProvider>
            <ErrorProviderWithUser>{children}</ErrorProviderWithUser>
        </UserProvider>
    );
};

/**
 * ErrorProvider that uses UserContext when available
 */
const ErrorProviderWithUser = ({ children }) => {
    // This component can safely use useUser since it's within UserProvider
    const { userRole } = useUser();

    return <ErrorProvider userRole={userRole}>{children}</ErrorProvider>;
};

export default AppProviders;
