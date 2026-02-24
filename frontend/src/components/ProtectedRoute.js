import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, firebaseUser, loading } = useAuth();

    console.log('🛡️ ProtectedRoute: Checking access...', {
        path: window.location.pathname,
        loading,
        hasUser: !!user,
        hasFirebaseUser: !!firebaseUser
    });

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>Loading...</div>;
    }

    if (!user && !firebaseUser) {
        console.warn('🚫 ProtectedRoute: Access Denied. Redirecting to /login');
        return <Navigate to="/login" />;
    }

    console.log('✅ ProtectedRoute: Access Granted');
    return children;
};

export default ProtectedRoute;
