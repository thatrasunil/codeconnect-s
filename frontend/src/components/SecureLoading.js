import React from 'react';
import Lottie from 'lottie-react';
import paperplaneData from '../assets/animations/paperplane.json';
import { motion } from 'framer-motion';

const SecureLoading = ({ message = "Initializing Secure Environment..." }) => {
    return (
        <div style={styles.container}>
            <div style={styles.content}>
                {/* Lottie Animation */}
                <div style={styles.lottieContainer}>
                    <Lottie
                        animationData={paperplaneData}
                        loop={true}
                        autoplay={true}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>

                {/* Loading Message */}
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={styles.message}
                >
                    {message}
                </motion.h2>

                {/* Progress Bar (Mock) */}
                <div style={styles.progressContainer}>
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                        style={styles.progressBar}
                    />
                </div>
            </div>

            {/* Background Effects */}
            <div style={styles.backdrop} />
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020617', // Dark slate background
        zIndex: 9999,
        fontFamily: '"Inter", sans-serif',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        position: 'relative',
    },
    lottieContainer: {
        width: '300px',
        height: '300px',
        marginBottom: '1rem',
    },
    message: {
        color: '#e2e8f0',
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '2rem',
        textAlign: 'center',
        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
    },
    progressContainer: {
        width: '240px',
        height: '6px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        background: 'linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4)',
        borderRadius: '3px',
    },
    backdrop: {
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.4) 0%, #020617 70%)',
    }
};

export default SecureLoading;
