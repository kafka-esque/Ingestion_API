import React, { createContext, useState, useContext, useCallback } from "react";

const UserContext = createContext();

// User roles
export const UserRoles = {
    USER: "user",
    ADMIN: "admin",
    SUPER_ADMIN: "super_admin",
};

export const UserProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(UserRoles.USER);
    const [userInfo, setUserInfo] = useState({
        id: null,
        name: "",
        email: "",
        role: UserRoles.USER,
    });

    const updateUserRole = useCallback((role) => {
        setUserRole(role);
        setUserInfo((prev) => ({ ...prev, role }));
    }, []);

    const updateUserInfo = useCallback((info) => {
        setUserInfo(info);
        setUserRole(info.role || UserRoles.USER);
    }, []);

    const isAdmin = useCallback(() => {
        return (
            userRole === UserRoles.ADMIN || userRole === UserRoles.SUPER_ADMIN
        );
    }, [userRole]);

    const logout = useCallback(() => {
        setUserRole(UserRoles.USER);
        setUserInfo({
            id: null,
            name: "",
            email: "",
            role: UserRoles.USER,
        });
    }, []);

    return (
        <UserContext.Provider
            value={{
                userRole,
                userInfo,
                updateUserRole,
                updateUserInfo,
                isAdmin,
                logout,
                UserRoles,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within UserProvider");
    }
    return context;
};
