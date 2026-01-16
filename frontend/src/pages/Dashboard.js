import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaLaptopCode, FaChartPie, FaHistory, FaProjectDiagram, FaTrophy, FaCode, FaBrain, FaArrowRight, FaBug, FaVial, FaMagic } from 'react-icons/fa';
import RoomChoiceModal from '../components/RoomChoiceModal';
import OnlineUsersModal from '../components/OnlineUsersModal';
import ChatbotButton from '../components/ChatbotButton';
import Loading from '../components/Loading';

import config from '../config';

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
                ownerName: user?.username || "Anonymous"
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

    if (loading) return <Loading message="Loading Dashboard..." size="fullscreen" />;
    if (isCreating) return <Loading message="Initializing Secure Environment..." size="fullscreen" />;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="dashboard-container">

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dashboard-header"
                style={{
                    marginBottom: '3rem',
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 className="welcome-title">
                        {getGreeting()}, <span className="gradient-text">{user?.username}</span>
                    </h1>
                    <p className="welcome-subtitle">
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
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
            </motion.div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatsCard icon={<FaLaptopCode />} title="Total Sessions" value={stats.totalSessions} color="#8b5cf6" delay={0.1} />
                <StatsCard icon={<FaProjectDiagram />} title="Active Projects" value={stats.roomsCreated} color="#06b6d4" delay={0.2} />


                <StatsCard icon={<FaChartPie />} title="Languages" value={stats.languagesUsed?.length || 0} color="#ec4899" delay={0.3} />
                <div onClick={() => setIsOnlineUsersModalOpen(true)} style={{ cursor: 'pointer' }}>
                    <StatsCard icon={<FaBrain />} title="Online Users" value={onlineUsers.length} color="#10b981" delay={0.4} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-grid">

                {/* Left Column: Tools & History */}
                <div>
                    {/* Quick Tools Section */}
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#cbd5e1' }}>Quick Actions</h2>
                    <div className="quick-actions-grid">
                        <Link to="/problems" className="glass-card action-card">
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#f59e0b' }}></div>
                            <div className="icon-box" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}><FaCode size={24} /></div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.25rem' }}>Problems Library</div>
                                <div style={{ color: '#94a3b8' }}>Practice algorithms & data structures</div>
                            </div>
                        </Link>
                        <button onClick={() => handleCreateRoom()} className="glass-card action-card" style={{ cursor: 'pointer', textAlign: 'left', background: 'none' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#8b5cf6' }}></div>
                            <div className="icon-box" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}><FaLaptopCode size={24} /></div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.25rem' }}>New Session</div>
                                <div style={{ color: '#94a3b8' }}>Start a collaborative coding room</div>
                            </div>
                        </button>
                    </div>

                    {/* Advanced Tools Section */}
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#cbd5e1' }}>Advanced Tools</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <Link to="/debugging" className="glass-card tool-card" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                            <div className="tool-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}><FaBug size={20} /></div>
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Debugging</div>
                                <div style={{ fontSize: '0.85rem', color: '#fca5a5' }}>Analyze & Fix</div>
                            </div>
                        </Link>
                        <Link to="/testing" className="glass-card tool-card" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <div className="tool-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}><FaVial size={20} /></div>
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Testing</div>
                                <div style={{ fontSize: '0.85rem', color: '#6ee7b7' }}>Run Unit Tests</div>
                            </div>
                        </Link>
                        <Link to="/codegen" className="glass-card tool-card" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                            <div className="tool-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}><FaMagic size={20} /></div>
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Code Gen</div>
                                <div style={{ fontSize: '0.85rem', color: '#fcd34d' }}>AI Assistant</div>
                            </div>
                        </Link>
                    </div>

                    <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaHistory color="#3b82f6" /> Recent Rooms
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {myRooms.length === 0 ? (
                            <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: '#64748b', borderStyle: 'dashed' }}>
                                <FaHistory size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No recent activity. Start your first session!</p>
                            </div>
                        ) : (
                            myRooms.map(room => (
                                <motion.div
                                    key={room.id}
                                    className="glass-card room-card"
                                    whileHover={{ x: 5, borderColor: '#3b82f6' }}
                                >
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div style={{
                                            width: '50px', height: '50px', borderRadius: '12px',
                                            background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                                        }}>
                                            {room.language === 'python' ? '🐍' : '📜'}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                                Room #{room.room_id}
                                                {!room.is_public && <span style={{ marginLeft: '10px', fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>PRIVATE</span>}
                                            </h3>
                                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                Created {new Date(room.created_at).toLocaleDateString()} • {room.language}
                                            </div>
                                        </div>
                                    </div>
                                    <Link to={`/room/${room.room_id}`} className="btn rejoin-btn">
                                        Rejoin
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Leaderboard */}
                <div className="leaderboard-column">
                    <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            <FaTrophy color="#fbbf24" /> Leaderboard
                        </h3>
                        {leaderboard.length === 0 ? (
                            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>No data yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {leaderboard.slice(0, 5).map((user, index) => (
                                    <div key={user.username} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#1e293b',
                                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                            <img src={user.avatar} alt={user.username} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.username}</span>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold' }}>{user.points}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link to="/leaderboard" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none' }}>View Full Leaderboard</Link>
                    </div>
                </div>
            </div>

            <style>{`
                .dashboard-container {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    min-height: calc(100vh - 80px);
                }
                @media (max-width: 768px) {
                    .dashboard-container {
                        padding: 1rem;
                    }
                }
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 3fr 1fr;
                    gap: 2rem;
                    align-items: start;
                }
                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }
                .action-card {
                    padding: 2rem;
                    text-decoration: none;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.05);
                    position: relative;
                    overflow: hidden;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                }
                .icon-box {
                    padding: 1rem;
                    border-radius: 16px;
                    margin-right: 1.5rem;
                }
                .tool-card {
                    padding: 1.5rem;
                    text-decoration: none;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    transition: transform 0.2s;
                }
                .tool-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .room-card {
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .rejoin-btn {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    padding: 0.6rem 1.5rem;
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                    text-decoration: none;
                }

                .dashboard-header {
                    padding: 3rem;
                }
                .welcome-title {
                    fontSize: 3rem;
                    fontWeight: 800;
                    marginBottom: 1rem;
                    lineHeight: 1.2;
                }
                .welcome-subtitle {
                    color: #94a3b8;
                    fontSize: 1.2rem;
                    maxWidth: 600px;
                }
                .header-actions {
                    marginTop: 2rem;
                    display: flex;
                    gap: 1rem;
                }
                .action-btn {
                    padding: 0.8rem 2rem;
                    fontSize: 1.1rem;
                    borderRadius: 12px;
                    display: flex;
                    alignItems: center;
                    gap: 10px;
                    text-decoration: none;
                }
                .secondary-btn {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                @media (max-width: 1024px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                    /* Ensure leaderboard is visible below main content on tablet/mobile */
                    .leaderboard-column {
                        display: block; 
                    }
                }

                @media (max-width: 768px) {
                    .dashboard-header {
                        padding: 1.5rem;
                    }
                    .welcome-title {
                        fontSize: 2rem;
                    }
                    .welcome-subtitle {
                        fontSize: 1rem;
                    }
                    .header-actions {
                        flex-direction: column;
                    }
                    .action-btn {
                        width: 100%;
                        justify-content: center;
                    }
                    .quick-actions-grid {
                        grid-template-columns: 1fr;
                    }
                    .room-card {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                    .rejoin-btn {
                        width: 100%;
                        text-align: center;
                    }
                }
            `}</style>

            <RoomChoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateRoom}
                onJoin={handleJoinRoom}

            />

            <OnlineUsersModal
                isOpen={isOnlineUsersModalOpen}
                onClose={() => setIsOnlineUsersModalOpen(false)}
                users={onlineUsers}
            />

            {/* AI Chatbot */}
            <ChatbotButton position="bottom-right" />
        </div>
    );
};

const StatsCard = ({ icon, title, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay || 0 }}
        className="glass-card"
        whileHover={{ y: -5, boxShadow: `0 10px 30px -10px ${color}40` }}
        style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}
    >
        <div style={{
            width: '60px', height: '60px', borderRadius: '16px',
            background: `${color}15`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: 1, color: 'white' }}>{value}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.5rem', fontWeight: '500' }}>{title}</div>
        </div>
    </motion.div>
);

export default Dashboard;
