import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; // Optional if we just trust the profile endpoint
import { loginUser, registerUser, getUserProfile } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Optional: Check expiry locally first
                    const decoded = jwtDecode(token);
                    if (decoded.exp * 1000 < Date.now()) {
                        throw new Error('Token expired');
                    }

                    const userData = await getUserProfile();
                    if (userData) {
                        setUser(userData);
                    } else {
                        // Token valid but backend rejected (e.g. user deleted)
                        logout();
                    }
                } catch (err) {
                    console.error("Auth check failed:", err);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Login
    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            if (data.access) {
                localStorage.setItem('token', data.access);
                const userData = await getUserProfile();
                setUser(userData);
                return { success: true };
            } else {
                return { success: false, error: "No token received" };
            }
        } catch (err) {
            console.error("Login error:", err);
            return { success: false, error: err.error || err.message || "Login failed" };
        }
    };

    // Register
    const register = async (username, email, password) => {
        try {
            const data = await registerUser({ username, email, password });
            if (data.access) {
                localStorage.setItem('token', data.access);
                // The signup response might already contain user data, 
                // but fetching profile ensures consistency
                const userData = await getUserProfile();
                setUser(userData);
                return { success: true };
            }
            const errorMsg = data.error || "Registration failed";
            return { success: false, error: errorMsg };
        } catch (err) {
            console.error("Registration error:", err);
            return { success: false, error: err.error || err.message || "Registration failed" };
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    // Placeholder for Google Login (Future Implementation)
    const loginWithGoogle = async () => {
        console.warn("Google login not yet implemented on backend without Firebase.");
        return { success: false, error: "Google login temporarily unavailable." };
    };

    // Helper compatibility getters
    const authMethod = 'backend';
    const firebaseUser = null; // Deprecated

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        loginWithGoogle, // Keep interface for now
        authMethod,
        firebaseUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
