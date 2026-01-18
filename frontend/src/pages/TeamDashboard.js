import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    if (!team) return <div className="loading">Loading Team...</div>;

    const isOwner = team.ownerId === user?.uid;

    return (
        <div className="dashboard-container">
            <div className="hero-section">
                <h1 className="hero-title">{team.name}</h1>
                <p className="hero-subtitle">
                    {team.memberCount} Members &bull;
                    Team ID: <span className="highlight-code">{team.id}</span>
                </p>
                <div style={{ marginTop: '10px' }}>
                    <button
                        className={`tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
                        onClick={() => setActiveTab('challenges')}
                    >
                        Challenges
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                        onClick={() => setActiveTab('members')}
                    >
                        Members
                    </button>
                    {isOwner && (
                        <button className="primary-btn" style={{ marginLeft: '20px' }} onClick={() => setShowCreateChallenge(true)}>
                            + New Challenge
                        </button>
                    )}
                </div>
            </div>

            <div className="dashboard-content">
                {activeTab === 'challenges' && (
                    <div className="rooms-grid">
                        {challenges.length === 0 ? (
                            <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                                <p>No active challenges. Create one to get started!</p>
                            </div>
                        ) : (
                            challenges.map(challenge => (
                                <div key={challenge.id} className="glass-card room-card" onClick={() => navigate(`/teams/${teamId}/challenge/${challenge.id}`)}>
                                    <div className="room-header">
                                        <h3>{challenge.title}</h3>
                                        <span className={`lang-badge ${challenge.status === 'active' ? 'javascript' : ''}`}>
                                            {challenge.status}
                                        </span>
                                    </div>
                                    <div className="room-footer">
                                        <span>{challenge.problemIds.length} Problems</span>
                                        <span>
                                            {challenge.endTime ? `Ends: ${new Date(challenge.endTime).toLocaleDateString()}` : 'No deadline'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="glass-card">
                        <h3>Team Members</h3>
                        <ul className="member-list">
                            {team.members && Object.entries(team.members).map(([memberId, details]) => (
                                <li key={memberId} style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <strong>{memberId === user.uid ? 'You' : (details.name || 'User ' + memberId.substring(0, 6))}</strong>
                                    <span style={{ float: 'right', opacity: 0.7 }}>
                                        {details.role} &bull; Joined {new Date(details.joinedAt).toLocaleDateString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
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
