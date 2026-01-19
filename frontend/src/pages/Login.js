import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaGoogle, FaArrowRight } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../logo.svg';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
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
            const res = await login(formData.username, formData.password);
            if (res.success) {
                navigate('/dashboard');
            } else {
                setError(res.error);
            }
        } catch (err) {
            setError('Failed to login');
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
                staggerChildren: 0.1,
                duration: 0.5
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
        <div className="login-container">
            {isLoading && <LoadingSpinner fullScreen={true} message="Signing in..." />}

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
                    <motion.div
                        className="logo-glow"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <img src={Logo} alt="CodeConnect Logo" style={{ width: '40px', height: '40px' }} />
                    </motion.div>
                    <h1>Welcome Back</h1>
                    <p>Enter your credentials to access your workspace</p>
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

                <form onSubmit={handleSubmit} className="login-form">
                    <motion.div className="input-group" variants={itemVariants}>
                        <label>Username</label>
                        <div className="input-wrapper">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="johndoe"
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
                                placeholder="••••••••"
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
                        <span>Sign In</span>
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
                    Don't have an account?
                    <Link to="/signup">Create account</Link>
                </motion.div>
            </motion.div>

            <style>{`
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: 'Inter', sans-serif;
                    transition: background-color 0.3s ease;
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
                    background: var(--accent-primary);
                    animation-delay: 0s;
                }

                .blob-2 {
                    bottom: -10%;
                    right: -10%;
                    width: 500px;
                    height: 500px;
                    background: var(--accent-secondary);
                    animation-delay: -5s;
                }

                .blob-3 {
                    top: 40%;
                    left: 40%;
                    width: 400px;
                    height: 400px;
                    background: var(--accent-glow);
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
                    background: var(--glass-bg);
                    backdrop-filter: blur(24px);
                    border: 1px solid var(--glass-border);
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    transition: all 0.3s ease;
                }

                .glass-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .logo-glow {
                    width: 70px;
                    height: 70px;
                    margin: 0 auto 1.5rem;
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 30px var(--accent-glow);
                }

                .logo-icon {
                    font-family: 'Fira Code', monospace;
                    font-weight: 800;
                    color: white;
                    font-size: 1.4rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .glass-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 0.5rem;
                    letter-spacing: -0.025em;
                }

                .glass-header p {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    margin: 0;
                }

                .error-message {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid var(--error);
                    color: var(--error);
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
                    color: var(--text-secondary);
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
                    color: var(--text-secondary);
                    font-size: 1rem;
                    transition: color 0.2s;
                    z-index: 2;
                }

                .input-wrapper input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 2.75rem;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.2s;
                }

                .input-wrapper input:focus {
                    background: rgba(0, 0, 0, 0.3);
                    border-color: var(--accent-primary);
                    box-shadow: 0 0 0 4px var(--accent-glow);
                }

                .input-wrapper input:focus + .input-icon {
                    color: var(--accent-primary);
                }

                .submit-btn {
                    width: 100%;
                    padding: 1rem;
                    margin-top: 1rem;
                    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
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
                    box-shadow: 0 4px 6px -1px var(--accent-glow);
                }

                .submit-btn:hover {
                    box-shadow: 0 10px 15px -3px var(--accent-glow);
                    filter: brightness(1.1);
                }

                .divider {
                    display: flex;
                    align-items: center;
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    margin: 2rem 0;
                }

                .divider::before,
                .divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: var(--border-color);
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
                    color: var(--text-secondary);
                }

                .footer-link a {
                    color: var(--accent-secondary);
                    text-decoration: none;
                    font-weight: 600;
                    margin-left: 0.5rem;
                    transition: color 0.2s;
                }

                .footer-link a:hover {
                    color: var(--accent-primary);
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

export default Login;
