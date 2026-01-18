import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaLaptopCode, FaChartPie, FaHistory, FaProjectDiagram, FaTrophy, FaCode, FaBrain, FaArrowRight, FaBug, FaVial, FaMagic } from 'react-icons/fa';
import RoomChoiceModal from '../components/RoomChoiceModal';
import OnlineUsersModal from '../components/OnlineUsersModal';
import LoadingSpinner from '../components/LoadingSpinner';

import config from '../config';
import './Dashboard.css';

import { auth } from '../firebase';
import {
    incrementUserStats,
    logTransaction,
    subscribeToOnlineUsers,
    createRoom,
    fetchUserData,
    fetchUserRooms,
    subscribeToLeaderboard
} from '../services/firestoreService';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalSessions: 0, roomsCreated: 0, languagesUsed: [] });
    const [myRooms, setMyRooms] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isOnlineUsersModalOpen, setIsOnlineUsersModalOpen] = useState(false);

    // Dynamic backend URL
    const BACKEND_URL = config.BACKEND_URL;

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;
            try {
                // 1. Fetch User Stats from Firestore
                const userData = await fetchUserData(user.uid || user.id);
                if (userData) {
                    setStats({
                        totalSessions: userData.rooms || 0, // Using rooms as proxy for sessions
                        roomsCreated: userData.rooms || 0,
                        languagesUsed: ['JavaScript', 'Python'] // Placeholder or needs aggregation
                    });
                }

                // 2. Fetch User Rooms
                const rooms = await fetchUserRooms(user.uid || user.id);
                setMyRooms(rooms);

            } catch (err) {
                console.error("Dashboard data load error", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user]);

    // Subscribe to Leaderboard
    useEffect(() => {
        const unsub = subscribeToLeaderboard(setLeaderboard);
        return () => unsub();
    }, []);

    // Subscribe to online users
    useEffect(() => {
        const unsubscribe = subscribeToOnlineUsers((users) => {
            setOnlineUsers(users);
        });
        return () => unsubscribe();
    }, []);



    const handleCreateRoom = async (options = {}) => {
        setIsCreating(true);
        try {
            const roomData = {
                ...options,
                ownerId: user?.id,
                ownerName: options.guestName || user?.username || "Anonymous"
            };

            const newRoom = await createRoom(roomData);

            if (newRoom.id) {
                // Increment Firestore stats
                if (user?.id) {
                    incrementUserStats(user.id, 'room');
                    logTransaction(user.id, 'ROOM_CREATED', { roomId: newRoom.id });
                }
                navigate(`/room/${newRoom.id}`);
            }
        } catch (err) {
            console.error('Failed to create room:', err);
            alert('Failed to create room: ' + err.message);
            setIsCreating(false);
        }
    };

    const handleJoinRoom = (roomId) => {
        navigate(`/room/${roomId}`);
    };

    if (loading) return <LoadingSpinner message="Loading Dashboard..." fullScreen={true} />;
    if (isCreating) return <LoadingSpinner message="Initializing Secure Environment..." fullScreen={true} />;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="dashboard-container">

            {/* Hero Section */}
            <motion.div
                className="dashboard-hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="hero-content">
                    <h1 className="hero-title">
                        {getGreeting()}, <br />
                        <span className="gradient-text">{user?.username}</span>
                    </h1>
                    <p className="hero-subtitle">
                        Ready to level up your coding skills? Start a session or tackle a new challenge from our library.
                    </p>
                    <div className="header-actions">
                        <button onClick={() => setIsModalOpen(true)} className="btn primary-btn action-btn">
                            <FaPlus /> Custom Session
                        </button>
                        <Link to="/problems" className="btn secondary-btn action-btn">
                            <FaCode /> Browse Problems
                        </Link>
                    </div>
                </div>
                <div className="hero-bg-glow"></div>
                <div className="hero-bg-glow-2"></div>
            </motion.div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatsCard icon={<FaLaptopCode />} title="Total Sessions" value={stats.totalSessions} color="#8b5cf6" delay={0.1} />
                <StatsCard icon={<FaProjectDiagram />} title="Active Projects" value={stats.roomsCreated} color="#06b6d4" delay={0.2} />
                <StatsCard icon={<FaChartPie />} title="Languages" value={stats.languagesUsed?.length || 0} color="#ec4899" delay={0.3} />
                <div onClick={() => setIsOnlineUsersModalOpen(true)} style={{ display: 'contents', cursor: 'pointer' }}>
                    <StatsCard icon={<FaBrain />} title="Online Users" value={onlineUsers.length} color="#10b981" delay={0.4} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-main-grid">

                {/* Left Column: Tools & History */}
                <div className="main-content">
                    {/* Quick Types */}
                    <div className="section-header">
                        <h2 className="section-title"><FaCode color="#f59e0b" /> Quick Start</h2>
                    </div>

                    <div className="quick-actions-grid">
                        <Link to="/problems" className="action-card" style={{ '--card-accent': '#f59e0b' }}>
                            <div className="icon-box" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                                <FaCode />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Problems Library</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Practice algorithms & data structures from our curated list</div>
                            </div>
                        </Link>

                        <button onClick={() => handleCreateRoom()} className="action-card" style={{ '--card-accent': '#8b5cf6', cursor: 'pointer', textAlign: 'left', width: '100%', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="icon-box" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
                                <FaLaptopCode />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>New Session</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Start a collaborative coding room instantly</div>
                            </div>
                        </button>
                    </div>

                    {/* Developer Tools */}
                    <div className="section-header" style={{ marginTop: '3rem' }}>
                        <h2 className="section-title"><FaMagic color="#ec4899" /> Developer Tools</h2>
                    </div>

                    <div className="tools-grid">
                        <Link to="/debugging" className="tool-card">
                            <div className="tool-icon-sm" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                                <FaBug />
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Debugging</div>
                                <div style={{ fontSize: '0.85rem', color: '#fca5a5' }}>Analyze & Fix Code</div>
                            </div>
                        </Link>

                        <Link to="/testing" className="tool-card">
                            <div className="tool-icon-sm" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                                <FaVial />
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Unit Testing</div>
                                <div style={{ fontSize: '0.85rem', color: '#6ee7b7' }}>Run Test Suites</div>
                            </div>
                        </Link>

                        <Link to="/codegen" className="tool-card">
                            <div className="tool-icon-sm" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>
                                <FaMagic />
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>AI Code Gen</div>
                                <div style={{ fontSize: '0.85rem', color: '#fcd34d' }}>Generate Snippets</div>
                            </div>
                        </Link>
                    </div>

                    {/* Recent Rooms */}
                    <div className="section-header" style={{ marginTop: '3rem' }}>
                        <h2 className="section-title"><FaHistory color="#3b82f6" /> Recent Activity</h2>
                    </div>

                    <div className="rooms-list">
                        {myRooms.length === 0 ? (
                            <div className="empty-state">
                                <FaHistory size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>No recent activity found. Start a session to see it here!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {myRooms.map(room => (
                                    <div key={room.id} className="room-card">
                                        <div className="room-info">
                                            <div className="lang-badge">
                                                {room.language === 'python' ? '🐍' : '📜'}
                                            </div>
                                            <div className="room-details">
                                                <h3>
                                                    Room #{room.room_id}
                                                    {!room.is_public && <span className="private-badge" style={{ marginLeft: '10px' }}>PRIVATE</span>}
                                                </h3>
                                                <div className="room-meta">
                                                    <span>{new Date(room.created_at).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span style={{ textTransform: 'capitalize' }}>{room.language}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link to={`/room/${room.room_id}`} className="rejoin-btn">
                                            Rejoin Session
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Leaderboard */}
                <aside className="sidebar">
                    <div className="leaderboard-panel">
                        <div className="leaderboard-title">
                            <FaTrophy color="#fbbf24" /> Top Performers
                        </div>

                        {leaderboard.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No data yet</p>
                        ) : (
                            <div className="leaderboard-list">
                                {leaderboard.slice(0, 5).map((user, index) => (
                                    <div key={user.username} className="leaderboard-item">
                                        <div className={`user-rank rank-${index + 1 > 3 ? 'other' : index + 1}`}>
                                            {index + 1}
                                        </div>
                                        <div className="user-info">
                                            <img src={user.avatar} alt={user.username} className="user-avatar" />
                                            <span className="user-name">{user.username}</span>
                                        </div>
                                        <span className="user-points">{user.points} pts</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link to="/leaderboard" className="view-all-link">
                            View Full Leaderboard <FaArrowRight size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                        </Link>
                    </div>
                </aside>
            </div>

            <RoomChoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateRoom}
                onJoin={handleJoinRoom}
                user={user}
            />

            <OnlineUsersModal
                isOpen={isOnlineUsersModalOpen}
                onClose={() => setIsOnlineUsersModalOpen(false)}
                users={onlineUsers}
            />
        </div>
    );
};

const StatsCard = ({ icon, title, value, color, delay }) => (
    <div className="stat-card" style={{ animationDelay: `${delay}s` }}>
        <div className="stat-icon-wrapper" style={{ background: `${color}15`, color: color }}>
            {icon}
        </div>
        <div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{title}</div>
        </div>
    </div>
);

export default Dashboard;
