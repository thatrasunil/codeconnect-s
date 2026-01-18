
import React, { useState } from 'react';
import { QUESTIONS_DATA } from '../data/problemsData';
import { teamService } from '../services/teamService';
import '../pages/Dashboard.css'; // Reusing dashboard styles for consistency

const CreateChallengeModal = ({ teamId, onClose, onCreated }) => {
    const [title, setTitle] = useState('');
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (selectedProblems.length === 0) {
            setError('Please select at least one problem.');
            setLoading(false);
            return;
        }

        try {
            await teamService.createChallenge(teamId, {
                title,
                problemIds: selectedProblems,
                startTime: startTime || new Date().toISOString(),
                endTime: endTime || null
            });
            onCreated();
            onClose();
        } catch (err) {
            setError('Failed to create challenge.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleProblem = (problemId) => {
        setSelectedProblems(prev =>
            prev.includes(problemId)
                ? prev.filter(id => id !== problemId)
                : [...prev, problemId]
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content challenge-modal">
                <h2>Create Team Challenge</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Challenge Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="e.g., Weekend Algorithm Sprint"
                        />
                    </div>

                    <div className="form-group">
                        <label>Start Time (Optional)</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                        <small style={{ color: '#888' }}>Leave blank to start immediately</small>
                    </div>

                    <div className="form-group">
                        <label>End Time (Optional)</label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />
                        <small style={{ color: '#888' }}>Leave blank for indefinite challenge</small>
                    </div>

                    <div className="form-group problem-selection">
                        <label>Select Problems ({selectedProblems.length})</label>
                        <div className="problems-list-scroll">
                            {QUESTIONS_DATA.map(problem => (
                                <div
                                    key={problem.id}
                                    className={`problem-item ${selectedProblems.includes(problem.id) ? 'selected' : ''}`}
                                    onClick={() => toggleProblem(problem.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedProblems.includes(problem.id)}
                                        readOnly
                                    />
                                    <span className="problem-title">{problem.title}</span>
                                    <span className={`difficulty-tag ${problem.difficulty.toLowerCase()}`}>
                                        {problem.difficulty}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Creating...' : 'Create Challenge'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .challenge-modal {
                    max-width: 600px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                .problems-list-scroll {
                    max-height: 250px;
                    overflow-y: auto;
                    border: 1px solid #333;
                    border-radius: 4px;
                    margin-top: 5px;
                    background: #1e1e1e;
                }
                .problem-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #2a2a2a;
                    transition: background 0.2s;
                }
                .problem-item:hover {
                    background: #2a2a2a;
                }
                .problem-item.selected {
                    background: #2c3e50;
                }
                .problem-item input {
                    margin-right: 10px;
                }
                .problem-title {
                    flex: 1;
                    color: #fff;
                }
                .difficulty-tag {
                    font-size: 0.8em;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .difficulty-tag.easy { color: #2ecc71; background: rgba(46, 204, 113, 0.1); }
                .difficulty-tag.medium { color: #f1c40f; background: rgba(241, 196, 15, 0.1); }
                .difficulty-tag.hard { color: #e74c3c; background: rgba(231, 76, 60, 0.1); }
            `}</style>
        </div>
    );
};

export default CreateChallengeModal;
