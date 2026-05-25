import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SecureLoading from './SecureLoading';

const ProtectedRoute = ({ children }) => {
    const { user, firebaseUser, loading } = useAuth();

    // While auth is resolving (max 800ms due to AuthContext timeout), show the loading screen
    if (loading) {
        return <SecureLoading message="Authenticating..." />;
    }

    if (!user && !firebaseUser) {
        console.warn('🚫 ProtectedRoute: Access Denied. Redirecting to /login');
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
