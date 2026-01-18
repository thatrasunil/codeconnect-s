import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teamService } from '../services/teamService';
import './Dashboard.css'; // Reusing dashboard styles for now

const Teams = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');

    useEffect(() => {
        if (user) {
            loadTeams();
        }
    }, [user]);

    const loadTeams = async () => {
        try {
            const data = await teamService.getMyTeams(user.uid);
            setTeams(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async () => {
        if (!newTeamName) return;
        try {
            await teamService.createTeam(newTeamName, user.uid);
            setNewTeamName('');
            setShowCreateModal(false);
            loadTeams();
        } catch (err) {
            alert('Failed to create team');
        }
    };

    return (
        <div className="dashboard-container">
            <div className="hero-section">
                <h1 className="hero-title">My Teams</h1>
                <p className="hero-subtitle">Collaborate and compete with your friends.</p>
                <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
                    + Create New Team
                </button>
            </div>

            <div className="dashboard-content">
                {loading ? (
                    <div>Loading teams...</div>
                ) : teams.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <h2>No Teams Found</h2>
                        <p>Join a team or create one to get started!</p>
                    </div>
                ) : (
                    <div className="rooms-grid">
                        {teams.map(team => (
                            <div key={team.id} className="glass-card room-card" onClick={() => navigate(`/teams/${team.id}`)}>
                                <div className="room-header">
                                    <h3>{team.name}</h3>
                                    <span className="lang-badge">{team.memberCount || 1} Members</span>
                                </div>
                                <div className="room-footer">
                                    <span>Owned by {team.ownerId === user.uid ? 'You' : 'Others'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <h2>Create a Team</h2>
                        <input
                            type="text"
                            placeholder="Team Name"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            className="glass-input"
                        />
                        <div className="modal-actions">
                            <button onClick={() => setShowCreateModal(false)} className="secondary-btn">Cancel</button>
                            <button onClick={handleCreateTeam} className="primary-btn">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teams;
