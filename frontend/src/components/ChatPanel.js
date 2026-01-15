import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FaPaperPlane, FaMicrophone, FaPaperclip, FaStop, FaReply, FaTimes, FaRobot, FaSmile, FaChevronRight, FaHeadphones } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../config';
import useVoice from '../hooks/useVoice';

const ChatPanel = ({ roomId, messages, onSendMessage, onReaction, isOpen, currentTypingUsers, onTyping, aiMode, setAiMode, onClose }) => {
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
                // In a real app we'd track 'read' state to avoid re-reading. 
                // Here we just read the last message if checking briefly.
                // A better heuristic: compare with previous message length or ID?
                // For now, let's just speak it. 
                // Note: This might re-speak on every render if we aren't careful.
                // We'll rely on the user turning voice mode on effectively "asking" to hear things.
                const text = lastMsg.content;
                speak(text);
            }
        } else {
            stopSpeaking();
        }
    }, [messages, voiceMode, speak, stopSpeaking]);


    // Sync local tab logic
    const activeTab = aiMode ? 'ai' : 'team';
    const handleTabChange = (tab) => {
        if (setAiMode) setAiMode(tab === 'ai');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeTab]);

    const handleSendMessage = () => {
        if (!messageText.trim()) return;
        const parentId = replyingTo ? replyingTo.id : null;
        onSendMessage(messageText, 'TEXT', null, parentId);
        setMessageText('');
        setReplyingTo(null);
        resetTranscript();
    };

    // --- File & Voice Handlers ---
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
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        }
    };

    // --- Renderers ---

    const MessageItem = ({ msg }) => {
        const [isHovered, setIsHovered] = useState(false);
        const isMe = msg.userId === (user?.username || user?.uid);
        const isAI = msg.userId === 'Gemini AI';

        // Time
        const timestamp = msg.createdAt || msg.timestamp || new Date();
        const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    marginBottom: '1rem',
                    padding: '0 0.5rem'
                }}
            >
                {/* Avatar & Name Row (Only for others) */}
                {!isMe && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', marginLeft: '4px' }}>
                        {isAI ? (
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(45deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaRobot size={12} color="white" />
                            </div>
                        ) : (
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: `hsl(${Math.abs((String(msg.senderName).charCodeAt(0) * 5) % 360)}, 70%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 'bold' }}>
                                {String(msg.senderName || '?').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                            {isAI ? 'Gemini AI' : (msg.senderName || 'User')}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{time}</span>
                    </div>
                )}

                {/* Bubble */}
                <div style={{ position: 'relative', maxWidth: '85%' }}>
                    {/* Reply Context */}
                    {msg.parentId && (
                        <div style={{
                            fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px',
                            background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '8px',
                            borderLeft: '2px solid #64748b', display: 'flex', alignItems: 'center', gap: '5px'
                        }}>
                            <FaReply size={10} />
                            <em>Replying to older message...</em>
                        </div>
                    )}

                    <div style={{
                        padding: '10px 14px',
                        borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: isMe
                            ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                            : isAI
                                ? 'rgba(139, 92, 246, 0.15)'
                                : 'rgba(30, 41, 59, 0.8)',
                        border: isAI ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '0.9rem',
                        lineHeight: '1.4'
                    }}>
                        {/* Content Rendering */}
                        {msg.type === 'IMAGE' ? (
                            <img src={msg.attachmentUrl || msg.fileUrl} alt="Shared" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                        ) : msg.type === 'AUDIO' ? (
                            <audio controls src={msg.attachmentUrl || msg.fileUrl} style={{ maxWidth: '200px' }} />
                        ) : (
                            <div>{String(msg.content || '')}</div>
                        )}
                    </div>

                    {/* Actions (Hover Only) */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                style={{
                                    position: 'absolute',
                                    top: '-15px',
                                    right: isMe ? 'auto' : '-10px',
                                    left: isMe ? '-10px' : 'auto',
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '20px',
                                    padding: '4px',
                                    display: 'flex',
                                    gap: '2px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                    zIndex: 10
                                }}
                            >
                                {['👍', '❤️', '😂', '🔥'].map(emoji => (
                                    <button
                                        key={emoji}
                                        onClick={() => onReaction && onReaction(msg.id, emoji)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 4px', transition: 'transform 0.1s' }}
                                        onMouseEnter={e => e.target.style.transform = 'scale(1.3)'}
                                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                                <div style={{ width: 1, background: '#475569', margin: '0 2px' }}></div>
                                <button onClick={() => setReplyingTo(msg)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0 4px' }}><FaReply size={12} /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Reactions Display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                            {Object.entries(msg.reactions.reduce((acc, curr) => {
                                const emoji = curr.emoji || curr;
                                acc[emoji] = (acc[emoji] || 0) + 1;
                                return acc;
                            }, {})).map(([emoji, count]) => (
                                <div key={emoji} style={{
                                    fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '10px', padding: '1px 6px', display: 'flex', alignItems: 'center', gap: '3px'
                                }}>
                                    <span>{emoji}</span>
                                    <span style={{ fontWeight: 'bold', color: '#cbd5e1' }}>{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    if (!isOpen) return null;

    const filteredMessages = messages.filter(msg => {
        const isAIMessage = msg.userId === 'Gemini AI' || msg.type === 'AI_PENDING' || msg.type === 'AI_PROMPT' || msg.type === 'AI_RESPONSE';
        return activeTab === 'team' ? !isAIMessage : isAIMessage;
    });

    return (
        <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
            borderLeft: '1px solid #334155'
        }}>
            {/* Header */}
            <div style={{
                padding: '12px 16px', background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)', borderBottom: '1px solid #334155',
                display: 'flex', flexDirection: 'column', gap: '10px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '1rem', background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            CodeConnect Chat
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={() => setVoiceMode(!voiceMode)}
                            title={voiceMode ? "Voice Mode: ON" : "Voice Mode: OFF"}
                            style={{
                                background: voiceMode ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.05)',
                                border: voiceMode ? '1px solid #4ade80' : '1px solid #334155',
                                color: voiceMode ? '#4ade80' : '#94a3b8',
                                cursor: 'pointer', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <FaHeadphones size={12} />
                        </button>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><FaTimes /></button>
                    </div>
                </div>

                {/* Pill Tabs */}
                <div style={{ background: '#334155', borderRadius: '8px', padding: '3px', display: 'flex' }}>
                    <button
                        onClick={() => handleTabChange('team')}
                        style={{
                            flex: 1, padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                            background: activeTab === 'team' ? '#475569' : 'transparent',
                            color: activeTab === 'team' ? 'white' : '#94a3b8',
                            transition: 'all 0.2s'
                        }}
                    >
                        Team
                    </button>
                    <button
                        onClick={() => handleTabChange('ai')}
                        style={{
                            flex: 1, padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                            background: activeTab === 'ai' ? 'linear-gradient(45deg, #7c3aed, #db2777)' : 'transparent',
                            color: activeTab === 'ai' ? 'white' : '#94a3b8',
                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                        }}
                    >
                        AI Assistant
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                {filteredMessages.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#64748b', gap: '10px', opacity: 0.5 }}>
                        {activeTab === 'ai' ? <FaRobot size={32} /> : <FaSmile size={32} />}
                        <span>No messages yet. Start chatting!</span>
                    </div>
                ) : (
                    filteredMessages.map(msg => <MessageItem key={msg.id || Math.random()} msg={msg} />)
                )}

                {/* Typing Indicator */}
                <AnimatePresence>
                    {currentTypingUsers?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{
                            padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
                            margin: '0 0 10px 10px', width: 'fit-content', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic'
                        }}>
                            {currentTypingUsers.join(', ')} is typing...
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid #334155' }}>
                {/* Reply Banner */}
                {replyingTo && (
                    <div style={{
                        background: '#1e293b', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid #3b82f6'
                    }}>
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                            Replying to <b>{replyingTo.senderName || 'User'}</b>
                        </span>
                        <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FaTimes /></button>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#334155', padding: '6px 6px 6px 12px', borderRadius: '24px', border: '1px solid #475569' }}>
                    <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }} title="Attach"><FaPaperclip /></button>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />

                    <input
                        type="text"
                        value={messageText}
                        onChange={e => { setMessageText(e.target.value); onTyping && onTyping(); }}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder={voiceMode && isListening ? "Listening..." : isRecording ? "Recording..." : "Type a message..."}
                        disabled={isRecording || (voiceMode && isListening)}
                        style={{
                            flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem'
                        }}
                    />

                    {messageText.trim() ? (
                        <button onClick={handleSendMessage} style={{
                            background: '#3b82f6', border: 'none', width: '32px', height: '32px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer',
                            transition: 'all 0.2s', transform: 'scale(1)'
                        }} onMouseEnter={e => e.target.style.transform = 'scale(1.1)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
                            <FaPaperPlane size={14} />
                        </button>
                    ) : (
                        <button
                            onMouseDown={voiceMode ? null : startRecordingAudio}
                            onMouseUp={voiceMode ? null : stopRecordingAudio}
                            onClick={voiceMode ? handleMicClick : null}
                            title={voiceMode ? (isListening ? "Stop Listening" : "Start Dictation") : "Hold to Record"}
                            style={{
                                background: isRecording ? '#ef4444' : isListening ? '#3b82f6' : 'transparent',
                                border: 'none', width: '32px', height: '32px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: isRecording || isListening ? 'white' : '#94a3b8', cursor: 'pointer'
                            }}
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
