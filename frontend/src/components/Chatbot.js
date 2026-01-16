import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane, FaCode, FaLightbulb, FaBug, FaTrash, FaHeadphones, FaMicrophone, FaStop } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';
import useVoice from '../hooks/useVoice';

const Chatbot = ({ isOpen, onClose, context = null, initialMessage = null }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: '👋 Hi! I\'m your AI coding assistant. I can help you with:\n\n• **Explain Code** - Understand complex code\n• **Debug Issues** - Find and fix bugs\n• **Write Code** - Generate code snippets\n• **Best Practices** - Learn coding tips\n\nHow can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [voiceMode, setVoiceMode] = useState(false);

    useEffect(() => {
        if (initialMessage) {
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.content === initialMessage) return prev;
                return [...prev, {
                    id: Date.now(),
                    role: 'assistant',
                    content: initialMessage,
                    timestamp: new Date()
                }];
            });
        }
    }, [initialMessage]);

    const {
        isListening,
        isSpeaking,
        transcript,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        resetTranscript
    } = useVoice();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Update Input with Transcript
    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    // TTS for Assistant Responses
    useEffect(() => {
        if (voiceMode && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'assistant' && lastMsg.id > 1) { // Skip intro message if desired, or play it. 
                // We'll skip intro for annoyance factor, only read new responses
                // Actually, let's just read whatever is new.
                // NOTE: logic here needs to determine if it's "newly added". 
                // Ideally, we'd have a 'read' flag. For now, simple check:
                // If it's the very last message and we haven't spoken it yet... (hard to track "spoken yet" easily without state)
                // We'll rely on the fact that this effect runs when `messages` changes.
                // So when a new message is added, we speak it.
                speak(lastMsg.content);
            }
        } else {
            stopSpeaking();
        }
    }, [messages, voiceMode, speak, stopSpeaking]);


    const quickActions = [
        { icon: <FaCode />, label: 'Explain Code', prompt: 'Explain this code in simple terms' },
        { icon: <FaBug />, label: 'Debug', prompt: 'Help me debug this code and find potential issues' },
        { icon: <FaLightbulb />, label: 'Optimize', prompt: 'How can I optimize this code for better performance?' },
    ];

    const handleSend = async (customPrompt = null) => {
        const messageText = customPrompt || input.trim();
        if (!messageText) return;

        resetTranscript(); // Clear voice buffer

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${config.BACKEND_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: messageText,
                    context: context || ''
                })
            });

            if (!response.ok) {
                throw new Error('AI service unavailable');
            }

            const data = await response.json();
            const aiMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: data.response || 'Sorry, I couldn\'t generate a response.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI Error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: '❌ Sorry, I\'m having trouble connecting to the AI service. Please make sure the backend is running and try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: 1,
                role: 'assistant',
                content: '👋 Chat cleared! How can I help you?',
                timestamp: new Date()
            }
        ]);
        stopSpeaking();
    };

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '400px',
                    maxWidth: 'calc(100vw - 40px)',
                    height: '600px',
                    maxHeight: 'calc(100vh - 40px)',
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    zIndex: 1000,
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                }}
            >
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem'
                        }}>
                            <FaRobot />
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>AI Assistant</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Powered by Gemini</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setVoiceMode(!voiceMode)}
                            title={voiceMode ? "Voice Mode: ON" : "Voice Mode: OFF"}
                            style={{
                                background: voiceMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255,255,255,0.1)',
                                border: voiceMode ? '1px solid #fff' : 'none',
                                borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer'
                            }}
                        >
                            <FaHeadphones size={12} />
                        </button>
                        <button
                            onClick={handleClearChat}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Clear Chat"
                        >
                            <FaTrash size={14} />
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <FaTimes size={16} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <div style={{
                                maxWidth: '85%',
                                padding: '12px 16px',
                                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                background: msg.role === 'user'
                                    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                border: msg.role === 'assistant' ? '1px solid rgba(139, 92, 246, 0.2)' : 'none',
                                color: 'white',
                                fontSize: '0.9rem',
                                lineHeight: '1.5'
                            }}>
                                {msg.role === 'assistant' ? (
                                    <ReactMarkdown
                                        components={{
                                            code: ({ node, inline, ...props }) => (
                                                <code
                                                    style={{
                                                        background: 'rgba(0, 0, 0, 0.3)',
                                                        padding: inline ? '2px 6px' : '8px',
                                                        borderRadius: '4px',
                                                        display: inline ? 'inline' : 'block',
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.85rem'
                                                    }}
                                                    {...props}
                                                />
                                            ),
                                            p: ({ ...props }) => <p style={{ margin: '8px 0' }} {...props} />,
                                            ul: ({ ...props }) => <ul style={{ marginLeft: '20px' }} {...props} />,
                                            ol: ({ ...props }) => <ol style={{ marginLeft: '20px' }} {...props} />
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-start'
                            }}
                        >
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '16px 16px 16px 4px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                display: 'flex',
                                gap: '6px',
                                alignItems: 'center'
                            }}>
                                <div className="typing-dot" style={{ animation: 'typing 1.4s infinite' }}></div>
                                <div className="typing-dot" style={{ animation: 'typing 1.4s infinite 0.2s' }}></div>
                                <div className="typing-dot" style={{ animation: 'typing 1.4s infinite 0.4s' }}></div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 2 && (
                    <div style={{
                        padding: '0 16px 8px',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                    }}>
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(action.prompt)}
                                disabled={isLoading}
                                style={{
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '20px',
                                    padding: '8px 12px',
                                    color: '#a78bfa',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s',
                                    opacity: isLoading ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {action.icon}
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div style={{
                    padding: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.2)'
                }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                                placeholder={voiceMode && isListening ? "Listening..." : "Ask me anything..."}
                                disabled={isLoading || (voiceMode && isListening)}
                                style={{
                                    width: '100%',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    paddingRight: voiceMode ? '40px' : '16px',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                            {voiceMode && (
                                <button
                                    onClick={handleMicClick}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: isListening ? '#ef4444' : 'transparent',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '28px',
                                        height: '28px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: isListening ? 'white' : '#94a3b8'
                                    }}
                                >
                                    {isListening ? <FaStop size={12} /> : <FaMicrophone size={14} />}
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            style={{
                                background: input.trim() && !isLoading
                                    ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                                    : 'rgba(139, 92, 246, 0.2)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                color: 'white',
                                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FaPaperPlane size={16} />
                        </button>
                    </div>
                </div>

                <style>{`
                    .typing-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: #8b5cf6;
                    }
                    
                    @keyframes typing {
                        0%, 60%, 100% {
                            opacity: 0.3;
                            transform: scale(0.8);
                        }
                        30% {
                            opacity: 1;
                            transform: scale(1.2);
                        }
                    }
                `}</style>
            </motion.div>
        </AnimatePresence>
    );
};

export default Chatbot;
