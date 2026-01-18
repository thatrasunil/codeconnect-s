import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaUsers, FaPlus, FaCalendarAlt, FaCode, FaArrowLeft, FaCrown, FaCopy, FaCheck } from 'react-icons/fa';
import { teamService } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';
import CreateChallengeModal from '../components/CreateChallengeModal';
import './Dashboard.css';

const TeamDashboard = () => {
    const { teamId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [showCreateChallenge, setShowCreateChallenge] = useState(false);
    const [activeTab, setActiveTab] = useState('challenges'); // 'challenges' or 'members'
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadData();
    }, [teamId]);

    const loadData = async () => {
        try {
            const [teamData, challengesData] = await Promise.all([
                teamService.getTeamDetails(teamId),
                teamService.getChallenges(teamId)
            ]);
            setTeam(teamData);
            setChallenges(challengesData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChallengeCreated = () => {
        loadData();
    };

    const copyTeamId = () => {
        navigator.clipboard.writeText(teamId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!team) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#94a3b8' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                Loading Squad...
            </motion.div>
        </div>
    );

    const isOwner = team.ownerId === user?.id;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' }}>

            {/* Back Button */}
            <motion.button
                whileHover={{ x: -5 }}
                onClick={() => navigate('/teams')}
                style={{
                    background: 'none', border: 'none', color: '#94a3b8',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem'
                }}
            >
                <FaArrowLeft /> Back to Teams
            </motion.button>

            {/* Hero Section */}
            <div className="glass-card" style={{ padding: '3rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h1 style={{
                                fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem',
                                background: 'linear-gradient(to right, #6366f1, #a855f7)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>
                                {team.name}
                            </h1>
                            <p style={{ color: '#94a3b8', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaUsers /> {team.memberCount} Members</span>
                                <span style={{ opacity: 0.5 }}>|</span>
                                <span
                                    onClick={copyTeamId}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '15px', fontSize: '0.9rem' }}
                                >
                                    ID: {team.id} {copied ? <FaCheck color="#10b981" /> : <FaCopy />}
                                </span>
                            </p>
                        </div>
                        {isOwner && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary"
                                onClick={() => setShowCreateChallenge(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}
                            >
                                <FaPlus /> New Challenge
                            </motion.button>
                        )}
                    </div>
                </div>
                {/* Decorative background element */}
                <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
            </div>

            {/* Setup Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    <button
                        className={`tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
                        onClick={() => setActiveTab('challenges')}
                        style={{
                            background: 'none', border: 'none', color: activeTab === 'challenges' ? '#fff' : '#94a3b8',
                            fontSize: '1.2rem', padding: '10px 20px', cursor: 'pointer',
                            borderBottom: activeTab === 'challenges' ? '2px solid #6366f1' : '2px solid transparent',
                            transition: 'all 0.3s'
                        }}
                    >
                        Active Challenges
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                        onClick={() => setActiveTab('members')}
                        style={{
                            background: 'none', border: 'none', color: activeTab === 'members' ? '#fff' : '#94a3b8',
                            fontSize: '1.2rem', padding: '10px 20px', cursor: 'pointer',
                            borderBottom: activeTab === 'members' ? '2px solid #6366f1' : '2px solid transparent',
                            transition: 'all 0.3s'
                        }}
                    >
                        Members
                    </button>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'challenges' && (
                        <motion.div
                            key="challenges"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rooms-grid"
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}
                        >
                            {challenges.length === 0 ? (
                                <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                                    <FaTrophy size={48} style={{ color: '#475569', marginBottom: '1rem' }} />
                                    <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>No active challenges. Time to compete!</p>
                                    {isOwner && <p style={{ color: '#64748b' }}>Click "New Challenge" to start one.</p>}
                                </div>
                            ) : (
                                challenges.map((challenge, i) => (
                                    <motion.div
                                        key={challenge.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(168, 85, 247, 0.3)' }}
                                        className="glass-card room-card"
                                        onClick={() => navigate(`/teams/${teamId}/challenge/${challenge.id}`)}
                                        style={{
                                            cursor: 'pointer', padding: '1.5rem',
                                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                            <span className={`lang-badge ${challenge.status === 'active' ? 'javascript' : ''}`} style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px' }}>
                                                {challenge.status.toUpperCase()}
                                            </span>
                                            {challenge.status === 'active' && <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />}
                                        </div>

                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem', color: 'white' }}>{challenge.title}</h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FaCode color="#818cf8" /> {challenge.problemIds.length} Problems
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FaCalendarAlt color="#f472b6" />
                                                {challenge.endTime ? `Ends: ${new Date(challenge.endTime).toLocaleDateString()}` : 'No deadline'}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'members' && (
                        <motion.div
                            key="members"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-card"
                            style={{ padding: '0' }}
                        >
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <h3 style={{ margin: 0 }}>Team Roster</h3>
                            </div>
                            <ul className="member-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {team.members && Object.entries(team.members).map(([memberId, details], i) => (
                                    <motion.li
                                        key={memberId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        style={{
                                            padding: '1.5rem',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            background: memberId === user.id ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #475569, #1e293b)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 'bold', fontSize: '1.1rem'
                                            }}>
                                                {(details.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: memberId === user.id ? '#818cf8' : 'white' }}>
                                                    {memberId === user.id ? 'You' : (details.name || 'User ' + memberId.substring(0, 6))}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                    Joined {new Date(details.joinedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        {details.role === 'owner' && (
                                            <span style={{
                                                background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24',
                                                padding: '4px 12px', borderRadius: '20px',
                                                fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px'
                                            }}>
                                                <FaCrown /> OWNER
                                            </span>
                                        )}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {showCreateChallenge && (
                <CreateChallengeModal
                    teamId={teamId}
                    onClose={() => setShowCreateChallenge(false)}
                    onCreated={handleChallengeCreated}
                />
            )}
        </div>
    );
};

export default TeamDashboard;
