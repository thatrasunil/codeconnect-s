import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPalette, FaCheck } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector = () => {
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentTheme = themes.find(t => t.id === theme) || themes[0];

    return (
        <div className="theme-selector" ref={dropdownRef} style={{ position: 'relative' }}>
            <motion.button
                className="theme-toggle-btn"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                }}
            >
                <FaPalette style={{ color: 'var(--accent-secondary)' }} />
                <span>{currentTheme.name}</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: '120%',
                            right: 0,
                            width: '180px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '16px',
                            padding: '8px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                            zIndex: 1000,
                            overflow: 'hidden'
                        }}
                    >
                        {themes.map((t) => (
                            <motion.button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    setIsOpen(false);
                                }}
                                whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: 'transparent',
                                    border: 'none',
                                    color: t.id === theme ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    textAlign: 'left',
                                    fontWeight: t.id === theme ? '600' : '400'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>{t.icon}</span>
                                    <span>{t.name}</span>
                                </div>
                                {t.id === theme && <FaCheck size={12} />}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeSelector;
