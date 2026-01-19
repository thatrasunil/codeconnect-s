import React from 'react';
import { motion } from 'framer-motion';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSelector = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'midnight' ? 'light' : 'midnight');
    };

    return (
        <motion.button
            className="theme-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
                background: theme === 'midnight' ? 'var(--bg-tertiary)' : '#f1f5f9',
                border: '1px solid var(--border-color)',
                borderRadius: '30px',
                padding: '4px',
                width: '64px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: theme === 'midnight' ? 'flex-end' : 'flex-start',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: theme === 'midnight' ? '#6366f1' : '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            >
                {theme === 'midnight' ? (
                    <FaMoon size={12} color="white" />
                ) : (
                    <FaSun size={12} color="white" />
                )}
            </motion.div>
        </motion.button>
    );
};

export default ThemeSelector;
