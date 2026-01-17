import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaBook, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import config from '../config';
import ProblemService from '../services/problemService';

const ProblemPanel = ({ questionId, isOpen, onClose }) => {
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!questionId) return;

        const fetchProblem = async () => {
            setLoading(true);
            try {
                setLoading(true);
                const data = await ProblemService.fetchProblem(questionId);
                setProblem(data);
            } catch (err) {
                console.error('Failed to load problem:', err);
                setError('Failed to load problem details.');
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchProblem();
        }
    }, [questionId, isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#1e293b', // Matches VS Code sidebar
            borderRight: '1px solid #334155',
            color: '#e2e8f0',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0f172a'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <FaBook className="text-blue-400" />
                    <span>Problem Description</span>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        title="Close Sidebar"
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                        <FaChevronLeft />
                    </button>
                )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {loading && <div className="p-4 text-center text-gray-400">Loading problem...</div>}

                {error && (
                    <div className="p-4 text-red-400 bg-red-900/20 rounded border border-red-900">
                        {error}
                    </div>
                )}

                {problem && (
                    <div className="prose prose-invert max-w-none">
                        <h2 style={{ marginTop: 0, color: '#f8fafc', fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>{problem.title}</h2>

                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', marginTop: '10px' }}>
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                background: problem.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.1)' :
                                    problem.difficulty === 'Medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: problem.difficulty === 'Easy' ? '#4ade80' :
                                    problem.difficulty === 'Medium' ? '#facc15' : '#f87171',
                                border: problem.difficulty === 'Easy' ? '1px solid #4ade80' :
                                    problem.difficulty === 'Medium' ? '1px solid #facc15' : '1px solid #f87171'
                            }}>
                                {problem.difficulty}
                            </span>
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                background: 'rgba(148, 163, 184, 0.1)',
                                color: '#94a3b8',
                                border: '1px solid #475569'
                            }}>
                                {problem.topic}
                            </span>
                        </div>

                        <div style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                            <ReactMarkdown
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline ? (
                                            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', overflowX: 'auto', margin: '1rem 0', border: '1px solid #334155' }}>
                                                <code className={className}
                                                    style={{ fontFamily: 'monospace', color: '#e2e8f0' }}
                                                    {...props}>
                                                    {children}
                                                </code>
                                            </div>
                                        ) : (
                                            <code className={className}
                                                style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}
                                                {...props}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            >
                                {problem.content || problem.description}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProblemPanel;
