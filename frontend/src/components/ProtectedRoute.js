import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, firebaseUser, loading } = useAuth();

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', paddingTop: '50px' }}>Loading...</div>;
    }

    if (!user && !firebaseUser) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
