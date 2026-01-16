import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        const result = await loginWithGoogle();
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(formData.username, formData.email, formData.password);
        if (res.success) {
            navigate('/login'); // Or dashboard if auto-login
        } else {
            setError(res.error);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {isLoading && <LoadingSpinner fullScreen={true} message="Creating account..." />}
            {/* Background Accents */}
            <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', background: 'var(--accent-secondary)', opacity: 0.1, filter: 'blur(80px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '300px', height: '300px', background: 'var(--accent-primary)', opacity: 0.1, filter: 'blur(80px)', borderRadius: '50%' }} />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '3rem',
                    position: 'relative',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        background: 'linear-gradient(to right, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.5rem'
                    }}>
                        Create Account
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Join the community today</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#fca5a5',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            textAlign: 'center'
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <FaUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Choose a username"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 2.75rem',
                                    borderRadius: '12px',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid var(--border-color)',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Enter your email"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 2.75rem',
                                    borderRadius: '12px',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid var(--border-color)',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Create a password"
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 1rem 0.875rem 2.75rem',
                                    borderRadius: '12px',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid var(--border-color)',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(6, 182, 212, 0.3)'
                        }}
                    >
                        Sign Up
                    </motion.button>
                </form>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                    <span style={{ padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>or continue with</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                </div>

                {/* Google Sign-In Button */}
                <motion.button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        background: 'white',
                        color: '#1f2937',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1,
                        transition: 'all 0.2s'
                    }}
                >
                    <FaGoogle style={{ fontSize: '1.1rem', color: '#EA4335' }} />
                    {isLoading ? 'Signing in...' : 'Continue with Google'}
                </motion.button>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600', textDecoration: 'none' }}>
                        Log in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
