import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaPlus, FaSignInAlt, FaCrown, FaUserFriends, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { teamService } from '../services/teamService';
import './Dashboard.css';

const Teams = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [joinTeamId, setJoinTeamId] = useState('');

    useEffect(() => {
        if (user) {
            loadTeams();
        }
    }, [user]);

    const loadTeams = async () => {
        try {
            const data = await teamService.getMyTeams(user.id);
            setTeams(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinTeam = async (e) => {
        e.preventDefault();
        if (!joinTeamId) return;
        try {
            await teamService.joinTeam(joinTeamId, user.id);
            setJoinTeamId('');
            loadTeams();
            alert('Joined team successfully!');
        } catch (err) {
            alert('Failed to join team: ' + err.message);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        if (!newTeamName) return;
        try {
            await teamService.createTeam(newTeamName, user.id);
            setNewTeamName('');
            setShowCreateModal(false);
            loadTeams();
        } catch (err) {
            alert('Failed to create team');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' }}>

            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Your Teams
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.25rem', marginBottom: '2.5rem' }}>
                        Collaborate, compete, and climb the leaderboards together.
                    </p>
                </motion.div>

                {/* Action Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}
                >
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary"
                        style={{ padding: '12px 24px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FaPlus /> Create New Team
                    </button>

                    <form onSubmit={handleJoinTeam} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Enter Invite Code"
                            value={joinTeamId}
                            onChange={(e) => setJoinTeamId(e.target.value)}
                            style={{
                                padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(30, 41, 59, 0.5)', color: 'white', minWidth: '250px', outline: 'none'
                            }}
                        />
                        <button type="submit" className="glass-card" style={{ padding: '0 20px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: '600' }}>
                            Join
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading your squads...</div>
            ) : teams.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card"
                    style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}
                >
                    <FaUsers size={64} style={{ color: '#475569', marginBottom: '1.5rem' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No Teams Yet</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                        You haven't joined any teams. Create one to invite friends or ask for an invite code!
                    </p>
                    <button onClick={() => setShowCreateModal(true)} className="btn-secondary">
                        Get Started
                    </button>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                    {teams.map((team, i) => (
                        <motion.div
                            key={team.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => navigate(`/teams/${team.id}`)}
                            className="glass-card"
                            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.3)' }}
                            style={{
                                padding: '2rem', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                                background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `linear-gradient(135deg, ${getRandomColor(team.name)}, ${getRandomColor(team.id)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {team.name.charAt(0).toUpperCase()}
                                </div>
                                {team.ownerId === user.id && (
                                    <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fbbf24', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <FaCrown size={10} /> OWNER
                                    </span>
                                )}
                            </div>

                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: 'white' }}>{team.name}</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaUserFriends /> {team.memberCount || 1} Members
                            </p>

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <span style={{ color: '#6366f1', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    View Dashboard <FaArrowRight size={12} />
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Team Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card"
                            style={{ padding: '2.5rem', maxWidth: '500px', width: '90%', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center' }}>Create a New Squad</h2>
                            <form onSubmit={handleCreateTeam}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem' }}>Team Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Algorithm Avengers"
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        className="glass-input"
                                        style={{ width: '100%', fontSize: '1.1rem', padding: '12px' }}
                                        autoFocus
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                                        Create Team
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper to generate consistent colors
const getRandomColor = (str) => {
    const colors = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default Teams;
