import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamService } from '../services/teamService';
import { QUESTIONS_DATA as problemsData } from '../data/problemsData';
import './Dashboard.css';

const ChallengeView = () => {
    const { teamId, challengeId } = useParams();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [challengeProblems, setChallengeProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, [challengeId]);

    const loadData = async () => {
        try {
            // 1. Get Leaderboard (which we also partially assume gives us challenge context via backend, but let's be explicit)
            // Actually, we need challenge details first to get the problem IDs.
            // But our service `getChallenges` returns all. We don't have a single `getChallenge`.
            // Let's assume `getChallenges` is cached or fast enough to just filter, or add `getChallenge` endpoint.
            // For now, let's just use `getChallenges` and filter related to the team.

            const challenges = await teamService.getChallenges(teamId);
            const challenge = challenges.find(c => c.id === challengeId);

            if (challenge) {
                // Filter problemsData to only those in the challenge
                const relevantProblems = problemsData.filter(p => challenge.problemIds.includes(p.id));
                setChallengeProblems(relevantProblems);
            }

            // 2. Get Leaderboard
            const lbData = await teamService.getLeaderboard(challengeId);
            setLeaderboard(lbData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const navigateToProblem = (problemId) => {
        // Pass teamChallengeId via query params so Editor knows to track it
        navigate(`/problems/${problemId}?teamChallengeId=${challengeId}`);
    };

    return (
        <div className="dashboard-container">
            <div className="hero-section">
                <h1 className="hero-title">Challenge Leaderboard</h1>
                <p className="hero-subtitle">Solve problems to rank up!</p>
            </div>

            <div className="dashboard-content">
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

                    {/* Problems List */}
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h2>Problems</h2>
                        <div className="glass-card">
                            {challengeProblems.length === 0 ? (
                                <p>Loading problems...</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {challengeProblems.map((p, index) => (
                                        <li key={p.id}
                                            onClick={() => navigateToProblem(p.id)}
                                            style={{
                                                padding: '1rem',
                                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between'
                                            }}
                                            className="problem-item-hover"
                                        >
                                            <span>{index + 1}. {p.title}</span>
                                            <span className={`difficulty-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h2>Live Rankings</h2>
                        <div className="glass-card">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Rank</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>User</th>
                                        <th style={{ textAlign: 'center', padding: '10px' }}>Solved</th>
                                        <th style={{ textAlign: 'right', padding: '10px' }}>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No submissions yet</td></tr>
                                    ) : (
                                        leaderboard.map((entry, index) => (
                                            <tr key={entry.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '10px' }}>#{index + 1}</td>
                                                <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {entry.userName || 'Anonymous'}
                                                    {index === 0 && ' 👑'}
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '10px' }}>{entry.problemsSolved}</td>
                                                <td style={{ textAlign: 'right', padding: '10px', fontWeight: 'bold', color: '#00ff96' }}>{entry.score}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ChallengeView;
