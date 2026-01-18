import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamService } from '../services/teamService';
import { problemsData } from '../data/problemsData';
import './Dashboard.css';

const TeamDashboard = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [showCreateChallenge, setShowCreateChallenge] = useState(false);
    const [newChallengeTitle, setNewChallengeTitle] = useState('');
    const [selectedProblems, setSelectedProblems] = useState([]);

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

    const handleCreateChallenge = async () => {
        if (!newChallengeTitle || selectedProblems.length === 0) return;

        // Default 24 hours
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + 24);

        try {
            await teamService.createChallenge(teamId, {
                title: newChallengeTitle,
                problemIds: selectedProblems,
                endTime: endTime.toISOString()
            });
            setShowCreateChallenge(false);
            loadData();
        } catch (err) {
            alert('Failed to create challenge');
        }
    };

    const toggleProblemSelection = (id) => {
        if (selectedProblems.includes(id)) {
            setSelectedProblems(selectedProblems.filter(p => p !== id));
        } else {
            setSelectedProblems([...selectedProblems, id]);
        }
    };

    if (!team) return <div className="loading">Loading Team...</div>;

    return (
        <div className="dashboard-container">
            <div className="hero-section">
                <h1 className="hero-title">{team.name}</h1>
                <p className="hero-subtitle">Team Dashboard</p>
            </div>

            <div className="dashboard-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>Active Challenges</h2>
                    <button className="primary-btn" onClick={() => setShowCreateChallenge(true)}>+ New Challenge</button>
                </div>

                <div className="rooms-grid">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="glass-card room-card" onClick={() => navigate(`/teams/${teamId}/challenge/${challenge.id}`)}>
                            <div className="room-header">
                                <h3>{challenge.title}</h3>
                                <span className="lang-badge">{challenge.status}</span>
                            </div>
                            <div className="room-footer">
                                <span>{challenge.problemIds.length} Problems</span>
                                <span>Ends: {new Date(challenge.endTime).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showCreateChallenge && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card" style={{ maxWidth: '600px', width: '90%' }}>
                        <h2>Create Challenge</h2>
                        <input
                            type="text"
                            placeholder="Challenge Title"
                            value={newChallengeTitle}
                            onChange={(e) => setNewChallengeTitle(e.target.value)}
                            className="glass-input"
                            style={{ marginBottom: '1rem' }}
                        />

                        <h3>Select Problems</h3>
                        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', padding: '10px' }}>
                            {problemsData.map(p => (
                                <div key={p.id}
                                    onClick={() => toggleProblemSelection(p.id)}
                                    style={{
                                        padding: '8px',
                                        cursor: 'pointer',
                                        background: selectedProblems.includes(p.id) ? 'rgba(0,255,150,0.2)' : 'transparent',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                    {selectedProblems.includes(p.id) ? '✅ ' : '⬜ '} {p.title} ({p.difficulty})
                                </div>
                            ))}
                        </div>

                        <div className="modal-actions" style={{ marginTop: '1rem' }}>
                            <button onClick={() => setShowCreateChallenge(false)} className="secondary-btn">Cancel</button>
                            <button onClick={handleCreateChallenge} className="primary-btn">Create Challenge</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamDashboard;
