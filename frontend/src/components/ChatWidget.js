import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaChevronDown } from 'react-icons/fa';
import config from '../config';
import styles from '../styles/ChatWidget.module.css';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: "Hi! 👋 Welcome to CodeConnect. I'm here to answer questions about pricing, features, or getting started.",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const [quickReplies, setQuickReplies] = useState([
        "How does real-time collaboration work?",
        "Is it free?",
        "Do I need an account?"
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isTyping]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // Add user message
        const userMsg = {
            id: Date.now(),
            type: 'user',
            text: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Optimistically remove quick replies to avoid clutter, or keep them? 
        // User request implies updated quick replies come from backend.
        setQuickReplies([]);

        try {
            const response = await fetch(`${config.BACKEND_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    page: 'landing'
                    // userId: 'guest' // Optional
                })
            });

            if (!response.ok) throw new Error('Chat service unavailable');

            const data = await response.json();
            const aiResponse = data.reply || "I didn't quite catch that. Try asking about features or pricing.";

            if (data.quickReplies) {
                setQuickReplies(data.quickReplies);
            }

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                text: aiResponse,
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                text: "I'm having trouble reaching the server. Please try again later!",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={styles.chatbotContainer} style={{ zIndex: 99999 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.chatWindow}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        {/* Header */}
                        <div className={styles.header}>
                            <div className={styles.titleContainer}>
                                <div className={styles.logo}>
                                    <FaRobot />
                                </div>
                                <div className={styles.headerText}>
                                    <h3>Ask CodeConnect</h3>
                                    <p>Support & FAQ</p>
                                </div>
                            </div>
                            <button onClick={toggleChat} className={styles.closeButton}>
                                <FaChevronDown />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className={styles.messagesContainer}>
                            {messages.map((msg) => (
                                <div key={msg.id} className={`${styles.message} ${msg.type === 'user' ? styles.userMessage : styles.aiMessage}`}>
                                    {msg.text}
                                    {/* <span className={styles.timestamp}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span> */}
                                </div>
                            ))}

                            {isTyping && (
                                <div className={`${styles.message} ${styles.aiMessage}`}>
                                    <div className={styles.typingIndicator}>
                                        <div className={styles.dot}></div>
                                        <div className={styles.dot}></div>
                                        <div className={styles.dot}></div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions (Chips) */}
                        {!isTyping && quickReplies.length > 0 && (
                            <div className={styles.quickActions}>
                                {quickReplies.map((action, i) => (
                                    <button
                                        key={i}
                                        className={styles.actionBtn}
                                        onClick={() => handleSendMessage(action)}
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className={styles.inputArea}>
                            <input
                                type="text"
                                className={styles.inputField}
                                placeholder="Ask something about CodeConnect..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                                disabled={isTyping}
                            />
                            <button
                                className={styles.sendButton}
                                onClick={() => handleSendMessage(inputValue)}
                                disabled={!inputValue.trim() || isTyping}
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FAB */}
            <motion.button
                className={`${styles.fab} ${isOpen ? styles.open : ''}`}
                onClick={toggleChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Ask CodeConnect"
            >
                <span className={styles.fabIcon}>
                    {isOpen ? <FaTimes /> : <FaComments />}
                </span>
            </motion.button>
        </div>
    );
};

export default ChatWidget;
