import React, { createContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [returnUrl, setReturnUrl] = useState('/');

    const openLoginModal = (url = '/') => {
        setReturnUrl(url);
        setShowLoginModal(true);
    };

    const closeLoginModal = () => {
        setShowLoginModal(false);
    };

    return (
        <AuthContext.Provider
            value={{
                showLoginModal,
                openLoginModal,
                closeLoginModal,
                returnUrl
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };