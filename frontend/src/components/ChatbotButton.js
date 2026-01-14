import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaCommentDots } from 'react-icons/fa';
import Chatbot from './Chatbot';

const ChatbotButton = ({ context = null, position = 'bottom-right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasNotification, setHasNotification] = useState(true);

    const handleOpen = () => {
        setIsOpen(true);
        setHasNotification(false);
    };

    const positionStyles = {
        'bottom-right': { bottom: '20px', right: '20px' },
        'bottom-left': { bottom: '20px', left: '20px' },
        'top-right': { top: '20px', right: '20px' },
        'top-left': { top: '20px', left: '20px' }
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpen}
                        style={{
                            position: 'fixed',
                            ...positionStyles[position],
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            border: 'none',
                            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4), 0 0 0 4px rgba(139, 92, 246, 0.1)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem',
                            zIndex: 999,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <FaRobot />

                        {/* Notification Badge */}
                        {hasNotification && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    background: '#ef4444',
                                    border: '2px solid white',
                                    animation: 'pulse-notification 2s infinite'
                                }}
                            />
                        )}

                        {/* Ripple Effect */}
                        <div style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'rgba(139, 92, 246, 0.3)',
                            animation: 'ripple 2s infinite'
                        }} />

                        <style>{`
                            @keyframes ripple {
                                0% {
                                    transform: scale(1);
                                    opacity: 1;
                                }
                                100% {
                                    transform: scale(1.5);
                                    opacity: 0;
                                }
                            }

                            @keyframes pulse-notification {
                                0%, 100% {
                                    transform: scale(1);
                                }
                                50% {
                                    transform: scale(1.2);
                                }
                            }
                        `}</style>
                    </motion.button>
                )}
            </AnimatePresence>

            <Chatbot
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                context={context}
            />
        </>
    );
};

export default ChatbotButton;
