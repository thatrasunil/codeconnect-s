import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FaPaperPlane, FaMicrophone, FaPaperclip, FaStop, FaReply, FaTimes, FaCommentDots, FaRobot } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../config';

const ChatPanel = ({ socket, roomId, messages, onSendMessage, onReaction, isOpen, currentTypingUsers, onTyping, aiMode, setAiMode }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messageText, setMessageText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Sync local tab state with aiMode prop if available, otherwise default to team
    const activeTab = aiMode ? 'ai' : 'team';

    const handleTabChange = (tab) => {
        if (setAiMode) {
            setAiMode(tab === 'ai');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages, activeTab]);

    const handleSendMessage = () => {
        if (!messageText.trim()) return;
        const parentId = replyingTo ? replyingTo.id : null;
        onSendMessage(messageText, 'TEXT', null, parentId); // Logic in Editor.js handles AI routing based on aiMode
        setMessageText('');
        setReplyingTo(null);
    };

    // ... (keep existing handlers: handleFileUpload, startRecording, etc.)

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!user) {
            toast.warning("Please login to share files.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${config.BACKEND_URL}/api/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                const type = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
                const parentId = replyingTo ? replyingTo.id : null;
                onSendMessage(data.filename, type, data.url, parentId);
                setReplyingTo(null);
            } else {
                const data = await res.json().catch(() => ({ error: 'Upload failed' }));
                toast.error("Upload failed: " + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error("Upload error", err);
            toast.error("Upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const startRecording = async () => {
        if (!user) {
            toast.warning("Please login to send voice notes.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                await uploadVoiceNote(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error("Mic access denied", err);
            toast.error("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const uploadVoiceNote = async (blob) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', blob, 'voice-note.webm');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${config.BACKEND_URL}/api/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                const parentId = replyingTo ? replyingTo.id : null;
                onSendMessage("Voice Message", 'AUDIO', data.url, parentId);
                setReplyingTo(null);
            }
        } catch (err) {
            console.error("Voice upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    const formatMessage = (msg) => {
        try {
            if (!msg) return null;
            const timestamp = msg.createdAt || msg.timestamp || new Date();
            const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let content;

            if (msg.type === 'AUDIO' || msg.isVoice) {
                const url = msg.attachmentUrl || msg.fileUrl;
                content = <audio controls src={url} style={{ width: '100%', marginTop: '5px' }} />;
            } else if (msg.type === 'IMAGE') {
                const url = msg.attachmentUrl || msg.fileUrl;
                content = <img src={url} alt="Shared" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '5px' }} />;
            } else if (msg.type === 'FILE') {
                const url = msg.attachmentUrl || msg.fileUrl;
                let fileContentDisplay = 'File';
                try {
                    if (typeof msg.content === 'object') {
                        fileContentDisplay = JSON.stringify(msg.content);
                    } else {
                        fileContentDisplay = String(msg.content || 'File');
                    }
                } catch (e) { fileContentDisplay = 'File'; }

                content = (
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-primary)', marginTop: '5px' }}>
                        <FaPaperclip /> {fileContentDisplay}
                    </a>
                );
            } else {
                let textContent = '';
                try {
                    if (typeof msg.content === 'object') {
                        textContent = JSON.stringify(msg.content);
                    } else {
                        textContent = String(msg.content || '');
                    }
                } catch (e) { textContent = '[Invalid Content]'; }

                content = <div className="message-text">{textContent}</div>;
            }

            // Parent Message Display
            let parentDisplay = null;
            if (msg.parentId) {
                const parent = messages.find(m => m.id === msg.parentId || m.id === parseInt(msg.parentId));
                if (parent) {
                    let parentContent = '';
                    try {
                        if (typeof parent.content === 'object') {
                            parentContent = JSON.stringify(parent.content).substring(0, 30) + '...';
                        } else {
                            parentContent = String(parent.content || '').substring(0, 30) + '...';
                        }
                    } catch (e) { parentContent = '...'; }

                    parentDisplay = (
                        <div style={{
                            borderLeft: '2px solid var(--accent-secondary)',
                            paddingLeft: '8px',
                            marginBottom: '6px',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '4px',
                            borderRadius: '0 4px 4px 0'
                        }}>
                            <strong>{String(parent.senderName || parent.userId || 'User').substring(0, 10)}:</strong> {parentContent}
                        </div>
                    );
                }
            }

            const senderName = String(msg.senderName || msg.userId || 'User');
            const senderInitial = senderName.charAt(0).toUpperCase() || '?';

            return (
                <motion.div
                    key={msg.id || msg.timestamp || Math.random()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px', position: 'relative' }}
                >
                    {parentDisplay}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {/* Avatar */}
                        {msg.userId === 'Gemini AI' ? (
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.9rem', color: 'white', flexShrink: 0
                            }}>
                                <FaRobot />
                            </div>
                        ) : (
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: `hsl(${Math.abs((String(senderName).charCodeAt(0) * 5) % 360)}, 70%, 50%)`,
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0
                            }}>
                                {senderInitial}
                            </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '2px', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: msg.userId === 'Gemini AI' ? '#f472b6' : '#f8fafc' }}>
                                    {msg.userId === 'Gemini AI' ? 'Gemini AI' : senderName.substring(0, 15)}
                                </span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span>{time}</span>
                                    <button
                                        onClick={() => setReplyingTo(msg)}
                                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                                        title="Reply"
                                    >
                                        <FaReply />
                                    </button>
                                </div>
                            </div>

                            {content}

                            <div className="message-reactions" style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
                                <button onClick={() => onReaction && onReaction(msg.id, '👍')} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '0.85rem' }}>👍</button>
                                <button onClick={() => onReaction && onReaction(msg.id, '❤️')} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '0.85rem' }}>❤️</button>
                                <button onClick={() => onReaction && onReaction(msg.id, '😂')} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '0.85rem' }}>😂</button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            );
        } catch (err) {
            console.error("Message rendering error", err, msg);
            return (
                <div key={msg?.id || Math.random()} style={{ color: 'red', fontSize: '0.8rem', padding: '0.5rem' }}>
                    Error rendering message
                </div>
            );
        }
    };

    if (!isOpen) return null;

    // Filter messages based on active Tab
    const filteredMessages = messages.filter(msg => {
        const isAIMessage = msg.userId === 'Gemini AI' || msg.type === 'AI_PENDING' || msg.type === 'AI_PROMPT' || msg.type === 'AI_RESPONSE';

        if (activeTab === 'team') {
            return !isAIMessage;
        }
        // AI Tab
        return isAIMessage;
    });

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #334155', background: 'rgba(0,0,0,0.2)' }}>
                <button
                    onClick={() => handleTabChange('team')}
                    style={{
                        flex: 1, padding: '10px', background: activeTab === 'team' ? 'var(--bg-secondary)' : 'transparent',
                        color: activeTab === 'team' ? 'white' : '#94a3b8', border: 'none', cursor: 'pointer',
                        borderBottom: activeTab === 'team' ? '2px solid #3b82f6' : 'none', fontWeight: '600'
                    }}
                >
                    Team Chat
                </button>
                <button
                    onClick={() => handleTabChange('ai')}
                    style={{
                        flex: 1, padding: '10px', background: activeTab === 'ai' ? 'var(--bg-secondary)' : 'transparent',
                        color: activeTab === 'ai' ? '#ec4899' : '#94a3b8', border: 'none', cursor: 'pointer',
                        borderBottom: activeTab === 'ai' ? '2px solid #ec4899' : 'none', fontWeight: '600',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                    }}
                >
                    AI Assistant ✨
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {Array.isArray(filteredMessages) ? filteredMessages.map(formatMessage) : <div style={{ color: 'red' }}>Error: Invalid messages data</div>}


                {/* Typing Indicator */}
                <AnimatePresence>
                    {currentTypingUsers && currentTypingUsers.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            style={{
                                padding: '8px 16px',
                                fontSize: '0.8rem',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '12px',
                                margin: '8px',
                                width: 'fit-content'
                            }}
                        >
                            <span className="jumping-dots">
                                <span className="dot-1">.</span>
                                <span className="dot-2">.</span>
                                <span className="dot-3">.</span>
                            </span>
                            <em>{currentTypingUsers.join(', ')} {currentTypingUsers.length === 1 ? 'is' : 'are'} typing...</em>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'rgba(30, 41, 59, 0.5)' }}>
                {isUploading && <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '5px' }}>Uploading...</div>}

                {/* Replying Banner */}
                {replyingTo && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderLeft: '3px solid #3b82f6',
                        padding: '8px',
                        marginBottom: '8px',
                        borderRadius: '4px',
                        color: '#94a3b8',
                        fontSize: '0.85rem'
                    }}>
                        <span>Replying to <strong>{(replyingTo.senderName || String(replyingTo.userId || 'User').substring(0, 10))}</strong>: {String(replyingTo.content || '').substring(0, 30)}...</span>
                        <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <FaTimes />
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {/* File Upload */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="btn icon-btn"
                        title="Attach File"
                        style={{ padding: '8px', color: '#94a3b8' }}
                    >
                        <FaPaperclip />
                    </button>

                    {/* Text Input */}
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => {
                            setMessageText(e.target.value);
                            if (onTyping) onTyping();
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={isRecording ? "Recording..." : "Type a message..."}
                        disabled={isRecording}
                        autoFocus
                        style={{
                            flex: 1,
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            padding: '0.6rem',
                            borderRadius: '20px',
                            color: 'white'
                        }}
                    />

                    {/* Voice Record */}
                    <button
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        className="btn icon-btn"
                        style={{
                            color: isRecording ? '#ef4444' : '#94a3b8',
                            background: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                            borderRadius: '50%',
                            width: '35px', height: '35px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Hold to Record"
                    >
                        {isRecording ? <FaStop /> : <FaMicrophone />}
                    </button>

                    {/* Send Button */}
                    <button
                        onClick={handleSendMessage}
                        className="btn primary-btn"
                        style={{ borderRadius: '50%', width: '35px', height: '35px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FaPaperPlane size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
