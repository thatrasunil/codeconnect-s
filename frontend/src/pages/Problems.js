import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaSearch, FaCode, FaCheckCircle, FaStar, FaLayerGroup } from 'react-icons/fa';
import { createRoom } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';



import ProblemService from '../services/problemService';

const Problems = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProblems = async () => {
            try {
                const data = await ProblemService.fetchAllProblems();
                setQuestions(data);
            } catch (err) {
                console.error("Failed to load problems:", err);
                setError("Failed to load problems. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        loadProblems();
    }, []);

    const handleSolve = async (question) => {
        try {
            const roomData = {
                title: `Solving: ${question.title}`,
                ownerId: user?.id || user?.uid || 'guest',
                questionId: question.id,
                language: question.language || 'javascript',
                isPublic: false
            };

            const newRoom = await createRoom(roomData);
            if (newRoom.id) {
                // Also assign the problem to the room in the backend to ensure linkage
                try {
                    await ProblemService.assignProblemToRoom(question.id, newRoom.id);
                } catch (assignErr) {
                    console.warn("Failed to implicitly assign problem:", assignErr);
                }
                navigate(`/room/${newRoom.id}?questionId=${question.id}`);
            }
        } catch (err) {
            console.error('Failed to create session:', err);
            alert('Could not start session.');
        }
    };

    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '4rem' }}>Loading Library...</div>;

    const sections = [
        { title: 'Beginner', description: 'Start your journey with fundamental concepts.', difficulty: 'Easy', color: '#10b981' },
        { title: 'Intermediate', description: 'Challenge yourself with complex algorithms.', difficulty: 'Medium', color: '#f59e0b' },
        { title: 'Advanced', description: 'Master sophisticated data structures and optimization.', difficulty: 'Hard', color: '#ef4444' }
    ];

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' }}>

            {/* Minimal Header */}
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, #f59e0b, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Learning Path
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    A structured curriculum to take you from beginner to expert.
                </p>
                <div style={{ position: 'relative', maxWidth: '500px', margin: '2rem auto 0' }}>
                    <FaSearch style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="Search any problem..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white',
                            outline: 'none', fontSize: '1rem'
                        }}
                    />
                </div>
            </div>

            {/* Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                {sections.map(section => {
                    const sectionQuestions = questions.filter(q =>
                        q.difficulty === section.difficulty &&
                        q.title.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (sectionQuestions.length === 0) return null;

                    return (
                        <div key={section.title}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                                <div style={{ padding: '10px', borderRadius: '12px', background: `${section.color}20`, color: section.color }}>
                                    <FaLayerGroup size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white', margin: 0 }}>{section.title}</h2>
                                    <p style={{ color: '#94a3b8', margin: '0.2rem 0 0', fontSize: '0.95rem' }}>{section.description}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                {sectionQuestions.map((q, i) => (
                                    <motion.div
                                        key={q.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        viewport={{ once: true }}
                                        className="glass-card"
                                        whileHover={{ y: -5, borderColor: section.color }}
                                        style={{
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            background: 'rgba(30, 41, 59, 0.4)',
                                            display: 'flex', flexDirection: 'column'
                                        }}
                                    >
                                        <div style={{ padding: '1.5rem', flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: `${section.color}15`, color: section.color, textTransform: 'uppercase' }}>
                                                    {q.difficulty}
                                                </span>
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{q.topic}</span>
                                            </div>
                                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#f8fafc' }}>{q.title}</h3>
                                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {q.content}
                                            </p>
                                        </div>
                                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <button
                                                onClick={() => handleSolve(q)}
                                                className="btn"
                                                style={{ width: '100%', background: 'transparent', border: `1px solid ${section.color}`, color: section.color, borderRadius: '8px', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600', transition: 'all 0.2s' }}
                                                onMouseOver={(e) => { e.currentTarget.style.background = section.color; e.currentTarget.style.color = 'white'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = section.color; }}
                                            >
                                                <FaCode /> Solve Now
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Problems;
