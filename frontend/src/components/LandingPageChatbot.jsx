import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaSparkles, FaChevronDown } from 'react-icons/fa';
import config from '../config';
import styles from '../styles/LandingPageChatbot.module.css';

const LandingPageChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            text: "Hi there! 👋 I'm the CodeConnect Assistant. How can I help you start your collaborative coding journey today?",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

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

        try {
            const response = await fetch(`${config.BACKEND_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: text })
            });

            if (!response.ok) throw new Error('AI unavailable');

            const data = await response.json();
            const aiResponse = data.response || "I'm having trouble thinking right now.";

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                text: aiResponse,
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error(error);
            // Fallback to local response if API fails
            const localResponse = generateLocalResponse(text);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                text: localResponse,
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const generateLocalResponse = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('create') || lower.includes('room'))
            return "To create a room, simply click the 'Start Coding Now' button in the hero section. It's instant and requires no account!";
        if (lower.includes('price') || lower.includes('cost') || lower.includes('free'))
            return "CodeConnect is currently 100% free for all users during our beta period. Enjoy unlimited rooms and collaboration!";
        if (lower.includes('features') || lower.includes('what'))
            return "We offer real-time code sync, voice chat, AI assistance, and safe sandboxed execution environments for multiple languages.";
        return "I'm having trouble connecting to the server, but fell free to explore the features section or jump right into a coding room!";
    };

    const quickActions = [
        "How to create a room?",
        "Is it free?",
        "What languages are supported?",
        "Tell me about the AI"
    ];

    return (
        <div className={styles.chatbotContainer}>
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
                                    <h3>CodeConnect Assistant</h3>
                                    <p>Always here to help</p>
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
                                    <span className={styles.timestamp}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
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

                            {/* Show Quick Actions only if last message was from AI */}
                            {!isTyping && messages[messages.length - 1].type === 'ai' && (
                                <div className={styles.quickActions}>
                                    {quickActions.map((action, i) => (
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

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className={styles.inputArea}>
                            <input
                                type="text"
                                className={styles.inputField}
                                placeholder="Ask a question..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                            />
                            <button
                                className={styles.sendButton}
                                onClick={() => handleSendMessage(inputValue)}
                                disabled={!inputValue.trim()}
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
            >
                <span className={styles.fabIcon}>
                    {isOpen ? <FaTimes /> : <FaComments />}
                </span>
            </motion.button>
        </div>
    );
};

export default LandingPageChatbot;
