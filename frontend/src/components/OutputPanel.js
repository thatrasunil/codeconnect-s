import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTerminal, FaTimes, FaTrash, FaCopy } from 'react-icons/fa';

const OutputPanel = ({ isOpen, output, onClose, isRunning, onClear }) => {
    // Helper to copy output
    const handleCopy = () => {
        const text = output.map(o => typeof o.content === 'object' ? JSON.stringify(o.content) : o.content).join('\n');
        navigator.clipboard.writeText(text);
        // Could show toast here but keeping it simple
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="output-panel"
                >
                    <div className="output-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem 1rem',
                        background: '#252526',
                        borderBottom: '1px solid #333'
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#ccc', fontWeight: '600' }}>
                            <FaTerminal size={12} /> CONSOLE
                        </span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleCopy} title="Copy Output" style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '0.8rem' }}>
                                <FaCopy />
                            </button>
                            <button onClick={onClear} title="Clear Console" style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '0.8rem' }}>
                                <FaTrash />
                            </button>
                            <button onClick={onClose} title="Close Panel" style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    <div className="output-content" style={{ flex: 1, padding: '1rem', overflowY: 'auto', fontFamily: 'monospace', fontSize: '13px', color: '#d4d4d4' }}>
                        {isRunning ? (
                            <div style={{ color: 'var(--accent-secondary)', fontStyle: 'italic' }}>Running code...</div>
                        ) : (
                            output.map((line, i) => (
                                <div key={i} style={{
                                    color: line.type === 'error' ? '#f87171' : line.type === 'warning' ? '#fbbf24' : line.type === 'success' ? '#4ade80' : '#d4d4d4',
                                    marginBottom: '4px',
                                    whiteSpace: 'pre-wrap',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    paddingBottom: '2px'
                                }}>
                                    {typeof line.content === 'object' ? JSON.stringify(line.content, null, 2) : String(line.content || '')}
                                </div>
                            ))
                        )}
                        {!isRunning && output.length === 0 && <span style={{ opacity: 0.5 }}>No output to display. Run code to see results.</span>}
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OutputPanel;
