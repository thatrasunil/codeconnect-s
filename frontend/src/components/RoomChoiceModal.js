import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSignInAlt, FaTimes, FaLock, FaGlobe } from 'react-icons/fa';

const RoomChoiceModal = ({ isOpen, onClose, onCreate, onJoin, user }) => {
    const [roomId, setRoomId] = useState('');
    const [mode, setMode] = useState('select'); // 'select', 'create', 'guest_name'
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [guestName, setGuestName] = useState('');

    const handleJoin = () => {
        if (roomId.trim()) {
            onJoin(roomId);
        }
    };

    const handleCreateSubmit = () => {
        // Check if user is guest/anonymous
        const username = user?.username || user?.displayName;
        const isGuest = !username || username === 'Anonymous' || username === 'Guest';

        if (isGuest && mode !== 'guest_name') {
            // Retrieve stored name if any
            const storedName = localStorage.getItem('codeconnect_guest_name');
            if (storedName) {
                onCreate({ isPublic: !isPrivate, password: isPrivate ? password : '', guestName: storedName });
            } else {
                setMode('guest_name');
            }
            return;
        }

        if (mode === 'guest_name') {
            if (!guestName.trim()) return;
            localStorage.setItem('codeconnect_guest_name', guestName);
            onCreate({ isPublic: !isPrivate, password: isPrivate ? password : '', guestName });
            return;
        }

        onCreate({ isPublic: !isPrivate, password: isPrivate ? password : '' });
    };

    const reset = () => {
        setMode('select');
        setIsPrivate(false);
        setPassword('');
        setRoomId('');
        setGuestName('');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(5px)',
                            zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '90%', maxWidth: '480px',
                                background: '#1e293b',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '24px',
                                padding: '2rem',
                                zIndex: 1001,
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={handleClose}
                                style={{
                                    position: 'absolute', top: '20px', right: '20px',
                                    background: 'rgba(255,255,255,0.05)', border: 'none',
                                    color: '#94a3b8', cursor: 'pointer',
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <FaTimes size={14} />
                            </button>

                            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: '800', color: 'white' }}>
                                {mode === 'create' ? 'Create Room' : mode === 'guest_name' ? 'Enter Your Name' : 'Start Collaborating'}
                            </h2>
                            <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem' }}>
                                {mode === 'create' ? 'Configure your new session.' : mode === 'guest_name' ? 'Please tell us who you are.' : 'Choose how you want to jump into code.'}
                            </p>

                            {mode === 'select' ? (
                                <div style={{ display: 'grid', gap: '1.25rem' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(99, 102, 241, 0.15)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setMode('create')}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                                            cursor: 'pointer', border: '1px solid rgba(99, 102, 241, 0.3)',
                                            borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)',
                                            width: '100%', textAlign: 'left'
                                        }}
                                    >
                                        <div style={{
                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                            width: '48px', height: '48px', borderRadius: '12px',
                                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.2rem', flexShrink: 0
                                        }}>
                                            <FaPlus />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>Create New Room</h3>
                                            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Host a session and invite others</div>
                                        </div>
                                    </motion.button>

                                    <div style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <FaSignInAlt style={{ color: '#10b981' }} />
                                            <span style={{ fontWeight: '600', color: '#e2e8f0' }}>Join Existing Room</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                placeholder="Enter Room ID"
                                                value={roomId}
                                                onChange={(e) => setRoomId(e.target.value)}
                                                style={{
                                                    flex: 1, padding: '0.75rem 1rem', borderRadius: '10px',
                                                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                                    color: 'white', outline: 'none'
                                                }}
                                                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                                            />
                                            <button
                                                onClick={handleJoin}
                                                disabled={!roomId.trim()}
                                                style={{
                                                    padding: '0 1.25rem', borderRadius: '10px', border: 'none',
                                                    background: roomId.trim() ? '#10b981' : 'rgba(255,255,255,0.05)',
                                                    color: roomId.trim() ? 'white' : 'rgba(255,255,255,0.2)',
                                                    fontWeight: '600', cursor: roomId.trim() ? 'pointer' : 'not-allowed'
                                                }}
                                            >
                                                Join
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : mode === 'guest_name' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>What should we call you?</label>
                                    <input
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="Enter your name..."
                                        style={{
                                            width: '100%', padding: '0.875rem', borderRadius: '12px',
                                            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white', outline: 'none'
                                        }}
                                        autoFocus
                                    />
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button
                                            onClick={() => setMode('create')}
                                            style={{
                                                flex: 1, padding: '0.875rem', borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.05)', color: 'white',
                                                border: 'none', cursor: 'pointer', fontWeight: '600'
                                            }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleCreateSubmit}
                                            style={{
                                                flex: 1, padding: '0.875rem', borderRadius: '12px',
                                                background: '#6366f1', color: 'white',
                                                border: 'none', cursor: 'pointer', fontWeight: '600'
                                            }}
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Create Mode Form
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            onClick={() => setIsPrivate(false)}
                                            style={{
                                                flex: 1, padding: '1rem', borderRadius: '12px',
                                                border: !isPrivate ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                                background: !isPrivate ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                                                color: !isPrivate ? '#3b82f6' : '#94a3b8',
                                                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                            }}
                                        >
                                            <FaGlobe size={20} />
                                            <span style={{ fontWeight: '600' }}>Public</span>
                                        </button>
                                        <button
                                            onClick={() => setIsPrivate(true)}
                                            style={{
                                                flex: 1, padding: '1rem', borderRadius: '12px',
                                                border: isPrivate ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                                background: isPrivate ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)',
                                                color: isPrivate ? '#ef4444' : '#94a3b8',
                                                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                            }}
                                        >
                                            <FaLock size={20} />
                                            <span style={{ fontWeight: '600' }}>Private</span>
                                        </button>
                                    </div>

                                    {isPrivate && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                        >
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Set Password</label>
                                            <input
                                                type="text"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter access code..."
                                                style={{
                                                    width: '100%', padding: '0.875rem', borderRadius: '12px',
                                                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                                    color: 'white', outline: 'none'
                                                }}
                                            />
                                        </motion.div>
                                    )}

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button
                                            onClick={() => setMode('select')}
                                            style={{
                                                flex: 1, padding: '0.875rem', borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.05)', color: 'white',
                                                border: 'none', cursor: 'pointer', fontWeight: '600'
                                            }}
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleCreateSubmit}
                                            style={{
                                                flex: 1, padding: '0.875rem', borderRadius: '12px',
                                                background: '#6366f1', color: 'white',
                                                border: 'none', cursor: 'pointer', fontWeight: '600'
                                            }}
                                        >
                                            Create Room
                                        </button>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RoomChoiceModal;
