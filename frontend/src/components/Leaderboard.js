import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import { subscribeToLeaderboard } from '../services/firestoreService';
import './Leaderboard.css';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToLeaderboard((firestoreUsers) => {
            const mappedUsers = firestoreUsers.map(u => ({
                username: u.displayName || u.email?.split('@')[0] || 'Anonymous',
                avatar: u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName || 'User'}`,
                rooms: u.rooms || 0,
                messages: u.messages || 0,
                points: u.points || 0
            }));
            setUsers(mappedUsers);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <FaTrophy size={24} color="#fbbf24" />; // Gold
        if (index === 1) return <FaMedal size={24} color="#fcd34d" />;  // Silver (Lighter Gold/Silver mix)
        if (index === 2) return <FaMedal size={24} color="#b45309" />;  // Bronze
        return <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>#{index + 1}</span>;
    };

    return (
        <div className="leaderboard-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Hero Section */}
                <div className="leaderboard-hero">
                    <h1 className="leaderboard-title">
                        <FaTrophy /> Hall of Fame
                    </h1>
                    <p className="leaderboard-subtitle">
                        Celebrating the top contributors and coding wizards of CodeConnect. Compete, collaborate, and climb the ranks!
                    </p>
                </div>

                {/* Table Section */}
                <div className="leaderboard-table-wrapper">
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Coder</th>
                                <th className="hide-mobile">Sessions</th>
                                <th className="hide-mobile">Messages</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="loading-state">
                                        Loading champions...
                                    </td>
                                </tr>
                            ) : users.map((user, index) => (
                                <motion.tr
                                    key={user.username}
                                    className={`leaderboard-row ${index < 3 ? 'top-3' : ''}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <td>
                                        <div className="rank-icon-wrapper">
                                            {getRankIcon(index)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            <img
                                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                                                alt={user.username}
                                                className="user-avatar-lg"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`;
                                                }}
                                            />
                                            <span className="user-name-lg">{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="hide-mobile" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{user.rooms}</td>
                                    <td className="hide-mobile" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{user.messages}</td>
                                    <td>{user.points.toLocaleString()}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Leaderboard;
