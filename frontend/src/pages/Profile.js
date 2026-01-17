import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaSave, FaDice, FaCamera } from 'react-icons/fa';
import config from '../config';
import { useToast } from '../contexts/ToastContext';

const Profile = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Parse initial seed from existing avatar URL or default
    const getInitialSeed = () => {
        if (user?.avatar?.includes('seed=')) {
            return user.avatar.split('seed=')[1];
        }
        return 'Felix';
    };

    const [seed, setSeed] = useState(getInitialSeed());
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });

    // Update form if user context changes
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email
            });
            setSeed(getInitialSeed());
        }
    }, [user]);

    const handleRandomizeAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        setSeed(randomSeed);
    };

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let token = localStorage.getItem('token');
            if (user?.provider === 'firebase' && auth.currentUser) {
                token = await auth.currentUser.getIdToken();
            }

            if (!token) {
                addToast('Authentication error', 'error');
                setLoading(false);
                return;
            }
            const res = await fetch(`${config.BACKEND_URL}/api/auth/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    avatar: avatarUrl
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                addToast('Profile updated successfully!', 'success');
                // Removed window.location.reload(); 
                // We trust smooth updates or next navigation
            } else {
                addToast('Failed to update profile', 'error');
            }
        } catch (err) {
            console.error(err);
            addToast('An error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 80px)', // Adjust for navbar
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
            padding: '2rem'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '3rem',
                    position: 'relative',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    background: 'rgba(30, 41, 59, 0.7)',
                    backdropFilter: 'blur(12px)'
                }}
            >
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute', top: '-100px', right: '-100px',
                    width: '200px', height: '200px', background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
                    opacity: 0.2, borderRadius: '50%', pointerEvents: 'none'
                }}></div>
                <div style={{
                    position: 'absolute', bottom: '-50px', left: '-50px',
                    width: '150px', height: '150px', background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
                    opacity: 0.2, borderRadius: '50%', pointerEvents: 'none'
                }}></div>


                <h1 style={{
                    fontSize: '2rem',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                }}>Edit Profile</h1>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            style={{
                                width: '120px', height: '120px',
                                borderRadius: '50%',
                                padding: '4px',
                                background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                            }}
                        >
                            <img
                                key={seed}
                                src={avatarUrl}
                                alt="Avatar"
                                style={{
                                    width: '100%', height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '4px solid #0f172a'
                                }}
                            />
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 180 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleRandomizeAvatar}
                            style={{
                                position: 'absolute', bottom: '0', right: '0',
                                background: '#1e293b', color: '#ec4899',
                                border: '2px solid #ec4899',
                                borderRadius: '50%',
                                width: '36px', height: '36px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                            }}
                            title="Randomize Avatar"
                        >
                            <FaDice />
                        </motion.button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <FaUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="text"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem',
                                    borderRadius: '8px',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem',
                                    borderRadius: '8px',
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="btn"
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            fontSize: '1rem',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Profile;
