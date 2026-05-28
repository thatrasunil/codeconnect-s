import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaArrowRight, FaUsers, FaMagic, FaCloud, FaLaptopCode } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../logo.svg';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register, loginWithGoogle, user, firebaseUser } = useAuth();
    const navigate = useNavigate();

    const [coords, setCoords] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    useEffect(() => {
        if (firebaseUser || user) {
            navigate('/dashboard');
        }
    }, [firebaseUser, user, navigate]);

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
                staggerChildren: 0.08,
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
        <div className="signup-page-container">
            {isLoading && <LoadingSpinner fullScreen={true} message="Creating your CodeConnect profile..." />}

            {/* Left Column: Premium Visual & Branding */}
            <div className="visual-hero-column">
                <div className="glow-mesh-bg">
                    <div className="glow-orb orb-cyan"></div>
                    <div className="glow-orb orb-emerald"></div>
                </div>

                <div className="floating-symbols">
                    <div className="symbol sym-1">{'{}'}</div>
                    <div className="symbol sym-2">{'</>'}</div>
                    <div className="symbol sym-3">{'() =>'}</div>
                    <div className="symbol sym-4">{'[]'}</div>
                    <div className="symbol sym-5">{'export'}</div>
                    <div className="symbol sym-6">{'default'}</div>
                </div>

                <div className="hero-branding-content">
                    <motion.div 
                        className="hero-logo-row"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <img src={Logo} alt="CodeConnect Logo" className="branding-logo-img" />
                        <span className="branding-logo-text">CodeConnect</span>
                    </motion.div>

                    <motion.h1 
                        className="hero-main-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Start Your <span className="gradient-highlight">Coding Journey</span>
                    </motion.h1>

                    <motion.p 
                        className="hero-description"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        Create an account to instantiate private and public collaboration rooms, invite team members, and stream compiler output.
                    </motion.p>

                    {/* Features Pills */}
                    <motion.div 
                        className="feature-pills-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <div className="feature-pill"><FaMagic className="pill-icon" /> Free Forever</div>
                        <div className="feature-pill"><FaUsers className="pill-icon" /> Instant Invite</div>
                        <div className="feature-pill"><FaCloud className="pill-icon" /> Cloud Workspaces</div>
                        <div className="feature-pill"><FaLaptopCode className="pill-icon" /> Open Source Core</div>
                    </motion.div>

                    {/* Collaborative UI Visual representation */}
                    <motion.div 
                        className="collaboration-mockup-card"
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
                    >
                        <div className="collab-titlebar">
                            <span className="collab-status-dot"></span>
                            <span className="collab-status-text">Active Pair Programmers (2)</span>
                        </div>
                        <div className="collab-avatars-row">
                            <div className="collab-user-badge color-cyan">
                                <span className="avatar-placeholder">U1</span>
                                <span className="user-name-tag">Alex (typing...)</span>
                            </div>
                            <div className="collab-user-badge color-emerald">
                                <span className="avatar-placeholder">U2</span>
                                <span className="user-name-tag">Sarah</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Column: Spotlight Signup Card */}
            <div className="login-card-column">
                <motion.div
                    className="spotlight-glass-card"
                    onMouseMove={handleMouseMove}
                    style={{
                        '--mx': `${coords.x}px`,
                        '--my': `${coords.y}px`
                    }}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="spotlight-overlay"></div>
                    <motion.div className="glass-card-header" variants={itemVariants}>
                        <div className="glow-logo-box">
                            <img src={Logo} alt="CodeConnect Logo" className="auth-logo-img" />
                        </div>
                        <h2>Create Account</h2>
                        <p>Join the community and start coding today</p>
                    </motion.div>

                    {error && (
                        <motion.div
                            className="creative-error-banner"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <span className="error-dot"></span>
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="creative-auth-form">
                        <motion.div className="creative-input-group" variants={itemVariants}>
                            <label>Username</label>
                            <div className="creative-input-wrapper">
                                <FaUser className="creative-input-icon" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="Choose a username"
                                    required
                                />
                                <div className="creative-input-focus-outline"></div>
                            </div>
                        </motion.div>

                        <motion.div className="creative-input-group" variants={itemVariants}>
                            <label>Email Address</label>
                            <div className="creative-input-wrapper">
                                <FaEnvelope className="creative-input-icon" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                    required
                                />
                                <div className="creative-input-focus-outline"></div>
                            </div>
                        </motion.div>

                        <motion.div className="creative-input-group" variants={itemVariants}>
                            <label>Password</label>
                            <div className="creative-input-wrapper">
                                <FaLock className="creative-input-icon" />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Min. 8 characters"
                                    required
                                />
                                <div className="creative-input-focus-outline"></div>
                            </div>
                        </motion.div>

                        <motion.button
                            type="submit"
                            className="creative-submit-btn"
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            variants={itemVariants}
                        >
                            <span>Initialize Profile</span>
                            <FaArrowRight className="submit-arrow" />
                        </motion.button>
                    </form>

                    <motion.div className="creative-divider" variants={itemVariants}>
                        <span className="line"></span>
                        <span className="text">or register via</span>
                        <span className="line"></span>
                    </motion.div>

                    <motion.button
                        onClick={handleGoogleSignIn}
                        className="creative-google-btn"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        variants={itemVariants}
                    >
                        <FaGoogle className="creative-google-icon" />
                        <span>Google Identity</span>
                    </motion.button>

                    <motion.div className="creative-footer-link" variants={itemVariants}>
                        Already registered?
                        <Link to="/login" className="signup-link">Sign In</Link>
                    </motion.div>
                </motion.div>
            </div>

            <style>{`
                .signup-page-container {
                    min-height: 100vh;
                    display: grid;
                    grid-template-columns: 1.1fr 0.9fr;
                    background: #020207;
                    font-family: 'Inter', sans-serif;
                    overflow: hidden;
                    position: relative;
                }

                /* Left Visual Hero Column */
                .visual-hero-column {
                    position: relative;
                    padding: 4rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                    overflow: hidden;
                    background: radial-gradient(circle at top left, rgba(6, 182, 212, 0.12) 0%, transparent 60%);
                }

                .glow-mesh-bg {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    filter: blur(140px);
                }

                .glow-orb {
                    position: absolute;
                    border-radius: 50%;
                    animation: orbFloat 25s infinite ease-in-out alternate;
                }

                .orb-cyan {
                    width: 450px;
                    height: 450px;
                    background: rgba(6, 182, 212, 0.15);
                    top: -10%;
                    left: -10%;
                }

                .orb-emerald {
                    width: 400px;
                    height: 400px;
                    background: rgba(16, 185, 129, 0.12);
                    bottom: 10%;
                    right: 10%;
                    animation-delay: -10s;
                }

                @keyframes orbFloat {
                    0% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(40px, 30px) scale(1.1); }
                    100% { transform: translate(-20px, -40px) scale(0.95); }
                }

                /* Floating Code Symbols */
                .floating-symbols {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 1;
                }

                .symbol {
                    position: absolute;
                    color: rgba(255, 255, 255, 0.04);
                    font-family: 'Fira Code', monospace;
                    font-weight: 600;
                    animation: floatSymbol 15s infinite ease-in-out;
                }

                .sym-1 { top: 15%; left: 10%; font-size: 1.8rem; animation-delay: 0s; }
                .sym-2 { top: 20%; right: 15%; font-size: 2.2rem; animation-delay: -3s; }
                .sym-3 { bottom: 25%; left: 8%; font-size: 1.5rem; animation-delay: -6s; }
                .sym-4 { bottom: 15%; right: 20%; font-size: 2rem; animation-delay: -9s; }
                .sym-5 { top: 50%; left: 40%; font-size: 1.2rem; animation-delay: -12s; }
                .sym-6 { bottom: 45%; right: 45%; font-size: 1.4rem; animation-delay: -4s; }

                @keyframes floatSymbol {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-25px) rotate(10deg); }
                }

                .hero-branding-content {
                    position: relative;
                    z-index: 2;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .hero-logo-row {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 3.5rem;
                }

                .branding-logo-img {
                    width: 32px;
                    height: 32px;
                    filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4));
                }

                .branding-logo-text {
                    font-size: 1.25rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: #ffffff;
                    background: linear-gradient(135deg, #ffffff 50%, rgba(255, 255, 255, 0.6));
                    -webkit-background-clip: text;
                    background-clip: text;
                }

                .hero-main-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: #ffffff;
                    line-height: 1.15;
                    margin-bottom: 1.5rem;
                    letter-spacing: -0.03em;
                }

                .gradient-highlight {
                    background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
                    -webkit-background-clip: text;
                    background-clip: text;
                    color: transparent;
                }

                .hero-description {
                    font-size: 1.15rem;
                    line-height: 1.6;
                    color: #94a3b8;
                    margin-bottom: 3rem;
                }

                .feature-pills-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-bottom: 3.5rem;
                }

                .feature-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1.25rem;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    color: #cbd5e1;
                    font-size: 0.95rem;
                    font-weight: 500;
                    transition: background 0.3s;
                }

                .feature-pill:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .pill-icon {
                    color: #06b6d4;
                }

                /* Collaboration Mockup */
                .collaboration-mockup-card {
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(10px);
                }

                .collab-titlebar {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.25rem;
                }

                .collab-status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 8px #10b981;
                }

                .collab-status-text {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #64748b;
                }

                .collab-avatars-row {
                    display: flex;
                    gap: 1.5rem;
                }

                .collab-user-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 1rem;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .avatar-placeholder {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #1e293b;
                    color: #ffffff;
                    font-size: 0.75rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .user-name-tag {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #cbd5e1;
                }

                .color-cyan .avatar-placeholder { background: rgba(6, 182, 212, 0.2); color: #06b6d4; border-color: rgba(6, 182, 212, 0.4); }
                .color-emerald .avatar-placeholder { background: rgba(16, 185, 129, 0.2); color: #10b981; border-color: rgba(16, 185, 129, 0.4); }


                /* Right Signup Form Column */
                .login-card-column {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2.5rem;
                    position: relative;
                    background: radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.08) 0%, transparent 60%);
                }

                /* Spotlight glass card */
                .spotlight-glass-card {
                    position: relative;
                    width: 100%;
                    max-width: 440px;
                    background: rgba(15, 23, 42, 0.45);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 28px;
                    padding: 3rem 2.5rem;
                    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6);
                    overflow: hidden;
                }

                /* Spotlight Glow logic via CSS variables */
                .spotlight-glass-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                    background: radial-gradient(
                        400px circle at var(--mx, 0px) var(--my, 0px),
                        rgba(6, 182, 212, 0.09) 0%,
                        transparent 80%
                    );
                }

                /* Edge glow effect using overlay */
                .spotlight-overlay {
                    position: absolute;
                    inset: 0;
                    border-radius: 28px;
                    pointer-events: none;
                    z-index: 1;
                    border: 1px solid transparent;
                    background: radial-gradient(
                        220px circle at var(--mx, 0px) var(--my, 0px),
                        rgba(6, 182, 212, 0.28) 0%,
                        transparent 70%
                    );
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                }

                .glass-card-header {
                    position: relative;
                    z-index: 2;
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .glow-logo-box {
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 1.25rem;
                    background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.15));
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 24px rgba(6, 182, 212, 0.15);
                }

                .auth-logo-img {
                    width: 32px;
                    height: 32px;
                }

                .glass-card-header h2 {
                    font-size: 2rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: #ffffff;
                    margin: 0 0 0.5rem;
                }

                .glass-card-header p {
                    font-size: 0.95rem;
                    color: #64748b;
                    margin: 0;
                }

                .creative-error-banner {
                    position: relative;
                    z-index: 2;
                    background: rgba(239, 68, 68, 0.08);
                    border: 1px solid rgba(239, 68, 68, 0.25);
                    color: #fca5a5;
                    padding: 0.85rem 1rem;
                    border-radius: 14px;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.75rem;
                }

                .error-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #ef4444;
                    box-shadow: 0 0 8px #ef4444;
                    flex-shrink: 0;
                }

                .creative-auth-form {
                    position: relative;
                    z-index: 2;
                }

                .creative-input-group {
                    margin-bottom: 1.5rem;
                }

                .creative-input-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #94a3b8;
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .creative-input-wrapper {
                    position: relative;
                }

                .creative-input-icon {
                    position: absolute;
                    left: 1.15rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #475569;
                    font-size: 1rem;
                    transition: color 0.2s;
                    z-index: 2;
                }

                .creative-input-wrapper input {
                    width: 100%;
                    padding: 0.95rem 1rem 0.95rem 2.85rem;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 14px;
                    color: #ffffff;
                    font-size: 0.95rem;
                    outline: none;
                    transition: all 0.2s;
                }

                .creative-input-wrapper input::placeholder {
                    color: #475569;
                }

                .creative-input-wrapper input:focus {
                    background: rgba(15, 23, 42, 0.8);
                    border-color: rgba(6, 182, 212, 0.5);
                }

                .creative-input-focus-outline {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    border-radius: 14px;
                    border: 1px solid transparent;
                    transition: all 0.2s;
                }

                .creative-input-wrapper input:focus ~ .creative-input-focus-outline {
                    box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.12);
                }

                .creative-input-wrapper input:focus ~ .creative-input-icon {
                    color: #06b6d4;
                }

                .creative-submit-btn {
                    width: 100%;
                    padding: 1.05rem;
                    background: linear-gradient(135deg, #06b6d4, #10b981);
                    border: none;
                    border-radius: 14px;
                    color: #ffffff;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.2s ease-out;
                    box-shadow: 0 6px 20px rgba(6, 182, 212, 0.35);
                }

                .creative-submit-btn:hover {
                    box-shadow: 0 10px 25px rgba(6, 182, 212, 0.5);
                    transform: translateY(-2px);
                    filter: brightness(1.15);
                }

                .submit-arrow {
                    transition: transform 0.2s;
                }

                .creative-submit-btn:hover .submit-arrow {
                    transform: translateX(4px);
                }

                .creative-divider {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    align-items: center;
                    margin: 2.25rem 0;
                }

                .creative-divider .line {
                    flex: 1;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.06);
                }

                .creative-divider .text {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #475569;
                    padding: 0 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .creative-google-btn {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    padding: 0.95rem;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 14px;
                    color: #cbd5e1;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    transition: all 0.2s;
                }

                .creative-google-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.15);
                    color: #ffffff;
                }

                .creative-google-icon {
                    color: #EA4335;
                    font-size: 1.1rem;
                }

                .creative-footer-link {
                    position: relative;
                    z-index: 2;
                    margin-top: 2.25rem;
                    text-align: center;
                    font-size: 0.9rem;
                    color: #64748b;
                }

                .creative-footer-link a {
                    color: #06b6d4;
                    text-decoration: none;
                    font-weight: 600;
                    margin-left: 0.5rem;
                    transition: all 0.2s;
                }

                .creative-footer-link a:hover {
                    color: #22d3ee;
                    text-decoration: underline;
                }

                @media (max-width: 1024px) {
                    .signup-page-container {
                        grid-template-columns: 1fr;
                    }
                    .visual-hero-column {
                        display: none;
                    }
                    .login-card-column {
                        min-height: 100vh;
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Signup;
