import React from 'react';
import { motion } from 'framer-motion';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = true, message = 'Loading...' }) => {
    const containerVariants = {
        animate: {
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
            },
        },
    };

    const planeVariants = {
        animate: {
            x: [0, 30, 0],
            y: [0, -20, 0],
            rotate: [0, 5, 0],
            transition: {
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
            },
        },
    };

    const cloudVariants = {
        animate: {
            x: [0, 15, 0],
            opacity: [0.6, 1, 0.6],
            transition: {
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
            },
        },
    };

    const shadowVariants = {
        animate: {
            scaleX: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            transition: {
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
            },
        },
    };

    return (
        <div className={`loading-spinner ${fullScreen ? 'fullscreen' : 'inline'}`}>
            <motion.div
                className="spinner-container"
                variants={containerVariants}
                initial="initial"
                animate="animate"
            >
                {/* Animated Plane/Arrow */}
                <motion.div className="plane-wrapper" variants={itemVariants}>
                    <motion.svg
                        className="plane"
                        viewBox="0 0 100 100"
                        width="80"
                        height="80"
                        variants={planeVariants}
                    >
                        {/* Plane/Arrow Shape */}
                        <motion.path
                            d="M 50 10 L 85 50 L 50 45 L 15 50 Z"
                            fill="url(#planeGradient)"
                            stroke="#5B4FFF"
                            strokeWidth="2"
                        />
                        {/* Plane details */}
                        <motion.circle cx="50" cy="35" r="3" fill="#fff" opacity="0.8" />
                        <defs>
                            <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366F1" />
                                <stop offset="100%" stopColor="#3B82F6" />
                            </linearGradient>
                        </defs>
                    </motion.svg>
                </motion.div>

                {/* Left Cloud */}
                <motion.div
                    className="cloud cloud-left"
                    variants={cloudVariants}
                >
                    <svg viewBox="0 0 100 50" width="70" height="35">
                        <path
                            d="M10 30 Q10 15 25 15 Q35 5 50 5 Q75 5 85 20 Q90 25 90 30 Z"
                            fill="#D1D5DB"
                            opacity="0.7"
                        />
                    </svg>
                </motion.div>

                {/* Right Cloud */}
                <motion.div
                    className="cloud cloud-right"
                    variants={cloudVariants}
                >
                    <svg viewBox="0 0 100 50" width="70" height="35">
                        <path
                            d="M10 30 Q10 15 25 15 Q35 5 50 5 Q75 5 85 20 Q90 25 90 30 Z"
                            fill="#D1D5DB"
                            opacity="0.6"
                        />
                    </svg>
                </motion.div>

                {/* Shadow/Ground */}
                <motion.div
                    className="shadow"
                    variants={shadowVariants}
                />

                {/* Loading Text */}
                {message && (
                    <motion.p
                        className="loading-text"
                        variants={itemVariants}
                        initial="initial"
                        animate="animate"
                    >
                        {message}
                    </motion.p>
                )}

                {/* Dots Animation */}
                <motion.div className="loading-dots" variants={itemVariants}>
                    <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoadingSpinner;
