import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
    FaPaperPlane, FaMicrophone, FaPaperclip, FaStop, FaReply,
    FaTimes, FaRobot, FaSmile, FaChevronRight, FaHeadphones,
    FaComments,
    FaEllipsisH, FaSearch, FaImage, FaFile
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../config';
import useVoice from '../hooks/useVoice';
import styles from '../styles/ChatPanelRedesign.module.css';

// Extracted MessageItem Component
const MessageItem = React.memo(({ msg, user, onReaction, onReply, allMessages }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isMe = msg.userId === (user?.username || user?.uid);
    const isAI = msg.userId === 'Gemini AI';
    const timestamp = msg.createdAt || msg.timestamp || new Date();
    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Find parent message if this is a reply
    const parentMessage = msg.parentId && allMessages ? allMessages.find(m => m.id === msg.parentId) : null;

    // Get preview text for parent message
    const getParentPreview = () => {
        if (!parentMessage) return 'Message not found';

        switch (parentMessage.type) {
            case 'IMAGE':
                return '📷 Image';
            case 'AUDIO':
                return '🎵 Voice Message';
            case 'FILE':
                return '📎 File';
            default:
                const content = String(parentMessage.content || '');
                return content.length > 50 ? content.substring(0, 50) + '...' : content;
        }
    };

    return (
        <div
            className={`${styles.messageRow} ${isMe ? styles.me : styles.other} ${isAI ? styles.ai : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Sender Info (Always show) */}
            <div className={styles.senderInfo}>
                {isAI ? (
                    <div className={styles.avatar} style={{ background: 'linear-gradient(45deg, #8b5cf6, #ec4899)' }}>
                        <FaRobot size={12} />
                    </div>
                ) : (
                    <div className={styles.avatar} style={{ background: `hsl(${Math.abs((String(msg.senderName || (isMe ? (user?.username || 'You') : 'Guest')).charCodeAt(0) * 5) % 360)}, 70%, 50%)` }}>
                        {String(msg.senderName || (isMe ? (user?.username || 'You') : 'Guest')).charAt(0).toUpperCase()}
                    </div>
                )}
                <span className={styles.senderName}>
                    {isAI ? 'Gemini AI' : (msg.senderName || (isMe ? (user?.username || 'You') : 'Guest'))}
                </span>
            </div>

            {/* Bubble */}
            <div className={styles.bubble}>
                {/* Reply Context */}
                {msg.parentId && (
                    <div style={{
                        fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', marginBottom: '6px',
                        background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px',
                        borderLeft: '3px solid rgba(139, 92, 246, 0.6)', display: 'flex', flexDirection: 'column', gap: '2px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
                            <FaReply size={10} />
                            <span>Replying to {parentMessage?.senderName || 'User'}</span>
                        </div>
                        <div style={{
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.6)',
                            fontStyle: 'italic',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {getParentPreview()}
                        </div>
                    </div>
                )}

                {/* Content */}
                {msg.type === 'IMAGE' ? (
                    <img src={msg.attachmentUrl || msg.fileUrl} alt="Shared" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                ) : msg.type === 'AUDIO' ? (
                    <audio controls src={msg.attachmentUrl || msg.fileUrl} style={{ maxWidth: '200px' }} />
                ) : (
                    <div style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '100%'
                    }}>{String(msg.content || '')}</div>
                )}

                {/* Timestamp */}
                <div className={styles.msgTime} style={{ textAlign: isMe ? 'right' : 'left', marginTop: '4px', color: 'rgba(255,255,255,0.6)' }}>
                    {time}
                </div>

                {/* Actions (Hover Only) */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            className={styles.reactionBar}
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            style={{ right: isMe ? 0 : 'auto', left: isMe ? 'auto' : 0 }}
                        >
                            {['👍', '❤️', '😂', '🔥', '🤔'].map(emoji => (
                                <button
                                    key={emoji}
                                    className={styles.reactionBtn}
                                    onClick={() => onReaction && onReaction(msg.id, emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                            <div style={{ width: 1, background: '#475569', margin: '0 2px' }}></div>
                            <button onClick={() => onReply && onReply(msg)} className={styles.reactionBtn} style={{ color: '#94a3b8' }}>
                                <FaReply size={12} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Reactions Display */}
            {msg.reactions && msg.reactions.length > 0 && (
                <div className={styles.activeReactions} style={{ justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    {Object.entries(msg.reactions.reduce((acc, curr) => {
                        const emoji = curr.emoji || curr;
                        acc[emoji] = (acc[emoji] || 0) + 1;
                        return acc;
                    }, {})).map(([emoji, count]) => (
                        <div key={emoji} className={styles.reactionPill}>
                            <span>{emoji}</span>
                            <span style={{ fontWeight: 'bold' }}>{count}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

const ChatPanel = ({
    roomId,
    messages,
    onSendMessage,
    onReaction,
    isOpen,
    currentTypingUsers,
    onTyping,
    aiMode,
    setAiMode,
    onClose
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messageText, setMessageText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [voiceMode, setVoiceMode] = useState(false);
    const textareaRef = useRef(null);

    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        resetTranscript
    } = useVoice();

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [messageText]);

    // Update Input with Transcript
    useEffect(() => {
        if (transcript) {
            setMessageText(transcript);
        }
    }, [transcript]);

    // TTS for AI Responses
    useEffect(() => {
        if (voiceMode && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.userId === 'Gemini AI') {
                speak(lastMsg.content);
            }
        } else {
            stopSpeaking();
        }
    }, [messages, voiceMode, speak, stopSpeaking]);

    const activeTab = aiMode ? 'ai' : 'team';
    const handleTabChange = (tab) => {
        if (setAiMode) setAiMode(tab === 'ai');
        // Reset scroll when switching tabs
        setTimeout(scrollToBottom, 100);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeTab, isOpen]);

    const handleSendMessage = () => {
        if (!messageText.trim()) return;
        const parentId = replyingTo ? replyingTo.id : null;
        onSendMessage(messageText, 'TEXT', null, parentId);
        setMessageText('');
        setReplyingTo(null);
        resetTranscript();
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${config.BACKEND_URL}/api/upload`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
            });
            if (res.ok) {
                const data = await res.json();
                const type = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
                onSendMessage(data.filename, type, data.url, replyingTo?.id);
                setReplyingTo(null);
            }
        } catch (err) { toast.error("Upload failed"); } finally { setIsUploading(false); }
    };

    const startRecordingAudio = async () => {
        if (!user) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            recorder.ondataavailable = e => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const formData = new FormData(); formData.append('file', blob, 'voice.webm');
                const token = localStorage.getItem('token');
                const res = await fetch(`${config.BACKEND_URL}/api/upload`, {
                    method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
                });
                if (res.ok) {
                    const data = await res.json();
                    onSendMessage("Voice Message", 'AUDIO', data.url, replyingTo?.id);
                    setReplyingTo(null);
                }
                stream.getTracks().forEach(t => t.stop());
            };
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) { toast.error("Mic access denied"); }
    };

    const stopRecordingAudio = () => {
        if (mediaRecorder?.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const handleMicClick = () => {
        if (voiceMode) {
            isListening ? stopListening() : startListening();
        } else {
            isRecording ? stopRecordingAudio() : startRecordingAudio();
        }
    };

    if (!isOpen) return null;

    const filteredMessages = messages.filter(msg => {
        const isAIMessage = msg.userId === 'Gemini AI' || msg.type === 'AI_PENDING' || msg.type === 'AI_PROMPT' || msg.type === 'AI_RESPONSE';
        return activeTab === 'team' ? !isAIMessage : isAIMessage;
    });

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.title}>
                        <FaComments size={18} color="#60a5fa" />
                        <span>CodeConnect Chat</span>
                    </div>
                    <div className={styles.controls}>
                        <button
                            className={`${styles.iconBtn} ${voiceMode ? styles.activeVoice : ''}`}
                            onClick={() => setVoiceMode(!voiceMode)}
                            title={voiceMode ? "Voice Mode: ON" : "Voice Mode: OFF"}
                        >
                            <FaHeadphones size={14} />
                        </button>
                        <button className={styles.iconBtn} onClick={onClose}>
                            <FaTimes size={14} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'team' ? styles.active : ''}`}
                        onClick={() => handleTabChange('team')}
                    >
                        Team Chat
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'ai' ? styles.activeAI : ''}`}
                        onClick={() => handleTabChange('ai')}
                    >
                        <FaRobot size={12} /> AI Assistant
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className={styles.messagesArea}>
                {filteredMessages.length === 0 ? (
                    <div className={styles.emptyState}>
                        {activeTab === 'ai' ? <FaRobot size={40} /> : <FaComments size={40} />}
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    filteredMessages.map(msg => <MessageItem key={msg.id || Math.random()} msg={msg} user={user} onReaction={onReaction} onReply={setReplyingTo} allMessages={filteredMessages} />)
                )}

                {/* Typing Indicator */}
                <AnimatePresence>
                    {currentTypingUsers?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={styles.typingIndicator}
                            style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', marginLeft: '1rem' }}
                        >
                            {currentTypingUsers.join(', ')} is typing...
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={styles.inputContainer}>
                {replyingTo && (
                    <div className={styles.replyContext}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaReply size={13} style={{ color: '#60a5fa', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 700 }}>
                                    Replying to {replyingTo.senderName || 'User'}
                                </span>
                            </div>
                            <div style={{
                                fontSize: '0.85rem',
                                color: '#e2e8f0',
                                lineHeight: '1.4',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                maxWidth: '100%',
                                paddingLeft: '19px'
                            }}>
                                {replyingTo.type === 'IMAGE' ? '📷 Image' :
                                    replyingTo.type === 'AUDIO' ? '🎵 Voice Message' :
                                        replyingTo.type === 'FILE' ? '📎 File' :
                                            String(replyingTo.content || '')}
                            </div>
                        </div>
                        <button
                            onClick={() => setReplyingTo(null)}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                flexShrink: 0,
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <FaTimes size={12} />
                        </button>
                    </div>
                )}

                <div className={styles.inputWrapper}>
                    <button
                        className={styles.attachBtn}
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach File"
                    >
                        <FaPaperclip />
                    </button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />

                    <textarea
                        ref={textareaRef}
                        className={styles.input}
                        placeholder={voiceMode && isListening ? "Listening..." : isRecording ? "Recording..." : "Type a message..."}
                        value={messageText}
                        onChange={e => { setMessageText(e.target.value); onTyping && onTyping(); }}
                        onKeyPress={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        disabled={isRecording || (voiceMode && isListening)}
                        rows={1}
                    />

                    {messageText.trim() ? (
                        <button className={styles.sendBtn} onClick={handleSendMessage}>
                            <FaPaperPlane size={14} />
                        </button>
                    ) : (
                        <button
                            className={`${styles.micBtn} ${isRecording || isListening ? styles.recording : ''}`}
                            onMouseDown={voiceMode ? null : startRecordingAudio}
                            onMouseUp={voiceMode ? null : stopRecordingAudio}
                            onClick={voiceMode ? handleMicClick : null}
                            title={voiceMode ? (isListening ? "Stop Listening" : "Start Dictation") : "Hold to Record"}
                        >
                            {isRecording || isListening ? <FaStop /> : <FaMicrophone />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
