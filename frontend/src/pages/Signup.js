import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaArrowRight } from 'react-icons/fa';
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
        try {
            const result = await loginWithGoogle();
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to login with Google');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await register(formData.username, formData.email, formData.password);
            if (res.success) {
                navigate('/login');
            } else {
                setError(res.error);
            }
        } catch (err) {
            setError('Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <div className="signup-container">
            {isLoading && <LoadingSpinner fullScreen={true} message="Creating account..." />}

            {/* Dynamic Background */}
            <div className="background-mesh">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <motion.div
                className="glass-card-wrapper"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="glass-header" variants={itemVariants}>
                    <div className="logo-glow">
                        <div className="logo-icon">{'{ CC }'}</div>
                    </div>
                    <h1>Create Account</h1>
                    <p>Join the community and start coding today</p>
                </motion.div>

                {error && (
                    <motion.div
                        className="error-message"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="signup-form">
                    <motion.div className="input-group" variants={itemVariants}>
                        <label>Username</label>
                        <div className="input-wrapper">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Choose a username"
                                required
                            />
                            <div className="input-border"></div>
                        </div>
                    </motion.div>

                    <motion.div className="input-group" variants={itemVariants}>
                        <label>Email</label>
                        <div className="input-wrapper">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                                required
                            />
                            <div className="input-border"></div>
                        </div>
                    </motion.div>

                    <motion.div className="input-group" variants={itemVariants}>
                        <label>Password</label>
                        <div className="input-wrapper">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Min. 8 characters"
                                required
                            />
                            <div className="input-border"></div>
                        </div>
                    </motion.div>

                    <motion.button
                        type="submit"
                        className="submit-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        variants={itemVariants}
                    >
                        <span>Sign Up</span>
                        <FaArrowRight />
                    </motion.button>
                </form>

                <motion.div className="divider" variants={itemVariants}>
                    <span>or continue with</span>
                </motion.div>

                <motion.button
                    onClick={handleGoogleSignIn}
                    className="google-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    variants={itemVariants}
                >
                    <FaGoogle className="google-icon" />
                    <span>Google</span>
                </motion.button>

                <motion.div className="footer-link" variants={itemVariants}>
                    Already have an account?
                    <Link to="/login">Sign In</Link>
                </motion.div>
            </motion.div>

            <style>{`
                .signup-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    background: #0f172a;
                    font-family: 'Inter', sans-serif;
                }

                .background-mesh {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    overflow: hidden;
                    z-index: 0;
                }

                .blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.4;
                    animation: float 20s infinite ease-in-out;
                }

                .blob-1 {
                    top: -10%;
                    left: -10%;
                    width: 500px;
                    height: 500px;
                    background: #8b5cf6;
                    animation-delay: 0s;
                }

                .blob-2 {
                    bottom: -10%;
                    right: -10%;
                    width: 500px;
                    height: 500px;
                    background: #06b6d4;
                    animation-delay: -5s;
                }

                .blob-3 {
                    top: 40%;
                    left: 40%;
                    width: 400px;
                    height: 400px;
                    background: #ec4899;
                    animation-delay: -10s;
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }

                .glass-card-wrapper {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 440px;
                    padding: 3rem;
                    background: rgba(30, 41, 59, 0.4);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .glass-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .logo-glow {
                    width: 60px;
                    height: 60px;
                    margin: 0 auto 1.5rem;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2));
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
                }

                .logo-icon {
                    font-family: 'Fira Code', monospace;
                    font-weight: 700;
                    color: white;
                    font-size: 1.2rem;
                }

                .glass-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    color: white;
                    margin: 0 0 0.5rem;
                    letter-spacing: -0.025em;
                }

                .glass-header p {
                    color: #94a3b8;
                    font-size: 0.95rem;
                    margin: 0;
                }

                .error-message {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #fca5a5;
                    padding: 0.75rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                    text-align: center;
                }

                .input-group {
                    margin-bottom: 1.25rem;
                }

                .input-group label {
                    display: block;
                    color: #cbd5e1;
                    font-size: 0.85rem;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    font-size: 1rem;
                    transition: color 0.2s;
                    z-index: 2;
                }

                .input-wrapper input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 2.75rem;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(51, 65, 85, 0.6);
                    border-radius: 12px;
                    color: white;
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.2s;
                }

                .input-wrapper input:focus {
                    background: rgba(15, 23, 42, 0.8);
                    border-color: #06b6d4;
                    box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
                }

                .input-wrapper input:focus + .input-icon {
                    color: #06b6d4;
                }

                .submit-btn {
                    width: 100%;
                    padding: 1rem;
                    margin-top: 1rem;
                    background: linear-gradient(135deg, #06b6d4, #8b5cf6);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(6, 182, 212, 0.3);
                }

                .submit-btn:hover {
                    box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.4);
                    filter: brightness(1.1);
                }

                .divider {
                    display: flex;
                    align-items: center;
                    color: #64748b;
                    font-size: 0.85rem;
                    margin: 2rem 0;
                }

                .divider::before,
                .divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.1);
                }

                .divider span {
                    padding: 0 1rem;
                }

                .google-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: white;
                    border: none;
                    border-radius: 12px;
                    color: #0f172a;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.2s;
                }

                .google-icon {
                    color: #EA4335;
                    font-size: 1.2rem;
                }

                .footer-link {
                    margin-top: 2rem;
                    text-align: center;
                    font-size: 0.9rem;
                    color: #94a3b8;
                }

                .footer-link a {
                    color: #8b5cf6;
                    text-decoration: none;
                    font-weight: 600;
                    margin-left: 0.5rem;
                    transition: color 0.2s;
                }

                .footer-link a:hover {
                    color: #a78bfa;
                    text-decoration: underline;
                }

                @media (max-width: 640px) {
                    .glass-card-wrapper {
                        padding: 2rem;
                        margin: 1rem;
                    }
                    
                    .glass-header h1 {
                        font-size: 1.75rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Signup;
