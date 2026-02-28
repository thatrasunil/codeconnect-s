import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    FaRobot, FaPaperPlane, FaMicrophone, FaStop, FaVolumeUp, FaVolumeMute,
    FaTrash, FaCopy, FaCheck, FaCode, FaBug, FaLightbulb, FaBrain,
    FaKeyboard, FaSpinner
} from 'react-icons/fa';
import config from '../config';
import useVoice from '../hooks/useVoice';

const STORAGE_KEY = 'ai_chat_history';

const SUGGESTED = [
    { icon: <FaCode />, label: 'Explain a concept', prompt: 'Explain how async/await works in JavaScript with examples' },
    { icon: <FaBug />, label: 'Debug code', prompt: 'Help me debug: my useState isn\'t updating correctly in React' },
    { icon: <FaLightbulb />, label: 'Best practices', prompt: 'What are the best practices for React performance optimization?' },
    { icon: <FaBrain />, label: 'Algorithm help', prompt: 'Explain binary search with a step-by-step example' },
];

// Code block with copy button
const CodeBlock = ({ children, className }) => {
    const [copied, setCopied] = useState(false);
    const lang = /language-(\w+)/.exec(className || '')?.[1] || 'code';
    const handleCopy = () => {
        navigator.clipboard.writeText(String(children));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div style={{ position: 'relative', margin: '12px 0' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(0,0,0,0.4)', borderRadius: '8px 8px 0 0',
                padding: '6px 12px', fontSize: '0.75rem', color: '#94a3b8'
            }}>
                <span>{lang}</span>
                <button onClick={handleCopy} style={{
                    background: 'transparent', border: 'none', color: copied ? '#34d399' : '#94a3b8',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem'
                }}>
                    {copied ? <><FaCheck size={10} /> Copied</> : <><FaCopy size={10} /> Copy</>}
                </button>
            </div>
            <pre style={{
                background: 'rgba(0,0,0,0.35)', borderRadius: '0 0 8px 8px',
                padding: '12px 16px', overflowX: 'auto', margin: 0,
                fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6, color: '#e2e8f0'
            }}>
                <code>{children}</code>
            </pre>
        </div>
    );
};

const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
        if (inline) {
            return <code style={{
                background: 'rgba(0,0,0,0.3)', padding: '2px 6px',
                borderRadius: 4, fontFamily: 'monospace', fontSize: '0.85em', color: '#c4b5fd'
            }} {...props}>{children}</code>;
        }
        return <CodeBlock className={className}>{children}</CodeBlock>;
    },
    p: ({ ...props }) => <p style={{ margin: '6px 0', lineHeight: 1.6 }} {...props} />,
    ul: ({ ...props }) => <ul style={{ marginLeft: 18, marginBottom: 6 }} {...props} />,
    ol: ({ ...props }) => <ol style={{ marginLeft: 18, marginBottom: 6 }} {...props} />,
    li: ({ ...props }) => <li style={{ marginBottom: 3 }} {...props} />,
    // eslint-disable-next-line jsx-a11y/heading-has-content
    h1: ({ ...props }) => <h1 style={{ fontSize: '1.3rem', margin: '10px 0 6px', color: '#c4b5fd' }} {...props} />,
    // eslint-disable-next-line jsx-a11y/heading-has-content
    h2: ({ ...props }) => <h2 style={{ fontSize: '1.1rem', margin: '10px 0 6px', color: '#a78bfa' }} {...props} />,
    // eslint-disable-next-line jsx-a11y/heading-has-content
    h3: ({ ...props }) => <h3 style={{ fontSize: '1rem', margin: '8px 0 4px', color: '#a78bfa' }} {...props} />,
    blockquote: ({ ...props }) => <blockquote style={{
        borderLeft: '3px solid #8b5cf6', paddingLeft: 12, margin: '8px 0',
        color: '#94a3b8', fontStyle: 'italic'
    }} {...props} />,
    strong: ({ ...props }) => <strong style={{ color: '#f1f5f9' }} {...props} />
};

const AIChatPage = () => {
    const [messages, setMessages] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const abortRef = useRef(null);

    const {
        isListening, isSpeaking, transcript,
        startListening, stopListening, speak, stopSpeaking, supported, resetTranscript
    } = useVoice();

    // Persist history
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }, [messages]);

    // Autoscroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fill input from voice transcript
    useEffect(() => {
        if (transcript) setInput(transcript);
    }, [transcript]);

    // Auto-submit when mic stops and transcript is ready
    useEffect(() => {
        if (!isListening && transcript.trim() && voiceEnabled) {
            const t = transcript;
            resetTranscript();
            sendMessage(t);
        }
        // eslint-disable-next-line
    }, [isListening]);

    const sendMessage = useCallback(async (text) => {
        const messageText = (text || input).trim();
        if (!messageText || isStreaming) return;

        setInput('');
        resetTranscript();
        stopSpeaking();

        const userMsg = { id: Date.now(), role: 'user', content: messageText, ts: new Date().toISOString() };
        const allMessages = [...messages, userMsg];
        setMessages(allMessages);
        setIsStreaming(true);

        // Placeholder for streaming AI response
        const aiId = Date.now() + 1;
        setMessages(prev => [...prev, { id: aiId, role: 'assistant', content: '', ts: new Date().toISOString(), streaming: true }]);

        try {
            const controller = new AbortController();
            abortRef.current = controller;

            const res = await fetch(`${config.BACKEND_URL}/api/ai/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: allMessages.map(m => ({ role: m.role, content: m.content })) }),
                signal: controller.signal
            });

            if (!res.ok) throw new Error('AI service unavailable');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            /* eslint-disable no-loop-func */
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
                for (const line of lines) {
                    const data = line.slice(6);
                    if (data === '[DONE]') break;
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.error) throw new Error(parsed.error);
                        if (parsed.token) {
                            fullText += parsed.token;
                            setMessages(prev => prev.map(m =>
                                m.id === aiId ? { ...m, content: fullText } : m
                            ));
                        }
                    } catch (_) { }
                }
            }
            /* eslint-enable no-loop-func */

            setMessages(prev => prev.map(m =>
                m.id === aiId ? { ...m, content: fullText, streaming: false } : m
            ));

            // TTS — strip markdown for speaking
            if (voiceEnabled && fullText) {
                const plainText = fullText.replace(/```[\s\S]*?```/g, 'code block').replace(/[*_`#>]/g, '');
                speak(plainText);
            }

        } catch (err) {
            if (err.name === 'AbortError') return;
            setMessages(prev => prev.map(m =>
                m.id === aiId ? { ...m, content: '❌ Connection failed. Check backend is running.', streaming: false } : m
            ));
        } finally {
            setIsStreaming(false);
            abortRef.current = null;
            inputRef.current?.focus();
        }
    }, [input, messages, isStreaming, voiceEnabled, speak, stopSpeaking, resetTranscript]);

    const handleStop = () => {
        abortRef.current?.abort();
        stopSpeaking();
        setIsStreaming(false);
    };

    const handleClear = () => {
        setMessages([]);
        localStorage.removeItem(STORAGE_KEY);
        stopSpeaking();
        inputRef.current?.focus();
    };

    const handleMic = () => {
        if (isListening) { stopListening(); }
        else { startListening(); }
    };

    const formatTime = (ts) => {
        try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
        catch { return ''; }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', -apple-system, sans-serif",
            color: 'white'
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(139,92,246,0.2)',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 46, height: 46, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(139,92,246,0.5)'
                    }}>
                        <FaRobot size={22} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.3px' }}>CodeConnect AI</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                            {isStreaming ? 'Thinking...' : 'Online · Llama 3.3 70B'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    {/* Voice toggle */}
                    {supported && (
                        <button onClick={() => { setVoiceEnabled(v => !v); if (voiceEnabled) stopSpeaking(); }}
                            title={voiceEnabled ? 'Voice: ON' : 'Voice: OFF'}
                            style={{
                                background: voiceEnabled ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)',
                                border: `1px solid ${voiceEnabled ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: 10, padding: '8px 14px', color: voiceEnabled ? '#c4b5fd' : '#94a3b8',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.85rem',
                                transition: 'all 0.2s'
                            }}>
                            {voiceEnabled ? <FaVolumeUp size={14} /> : <FaVolumeMute size={14} />}
                            {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
                        </button>
                    )}
                    {/* Clear */}
                    <button onClick={handleClear} disabled={messages.length === 0}
                        title="Clear chat"
                        style={{
                            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10, padding: '8px 14px', color: '#94a3b8',
                            cursor: messages.length === 0 ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.85rem',
                            opacity: messages.length === 0 ? 0.4 : 1, transition: 'all 0.2s'
                        }}>
                        <FaTrash size={13} /> Clear
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '24px',
                display: 'flex', flexDirection: 'column', gap: 20,
                scrollbarWidth: 'thin', scrollbarColor: '#4c1d95 transparent'
            }}>
                {/* Empty state */}
                {messages.length === 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 32, textAlign: 'center' }}>
                        <div>
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
                                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 40px rgba(139,92,246,0.4)'
                            }}>
                                <FaRobot size={40} />
                            </div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 8, background: 'linear-gradient(135deg, #c4b5fd, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                CodeConnect AI
                            </h2>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto' }}>
                                Your intelligent coding assistant. Ask me anything about code, debugging, algorithms or best practices.
                                {supported && voiceEnabled && <span style={{ display: 'block', marginTop: 8, color: '#a78bfa' }}>🎤 Voice mode active — just speak!</span>}
                            </p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, width: '100%', maxWidth: 600 }}>
                            {SUGGESTED.map((s, i) => (
                                <motion.button key={i}
                                    whileHover={{ scale: 1.02, background: 'rgba(139,92,246,0.2)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => sendMessage(s.prompt)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.25)',
                                        borderRadius: 14, padding: '14px 16px', color: 'white', cursor: 'pointer',
                                        textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8,
                                        transition: 'all 0.2s'
                                    }}>
                                    <div style={{ color: '#a78bfa', fontSize: '1.1rem' }}>{s.icon}</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.label}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.4 }}>{s.prompt}</div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Message bubbles */}
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div key={msg.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 12 }}>

                            {/* AI Avatar */}
                            {msg.role === 'assistant' && (
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4
                                }}>
                                    <FaRobot size={16} />
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '78%' }}>
                                <div style={{
                                    padding: msg.role === 'user' ? '12px 18px' : '14px 18px',
                                    borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : 'rgba(255,255,255,0.06)',
                                    border: msg.role === 'assistant' ? '1px solid rgba(139,92,246,0.2)' : 'none',
                                    backdropFilter: msg.role === 'assistant' ? 'blur(10px)' : 'none',
                                    fontSize: '0.92rem', lineHeight: 1.6, color: 'white'
                                }}>
                                    {msg.role === 'assistant' ? (
                                        <>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                                {msg.content || ' '}
                                            </ReactMarkdown>
                                            {msg.streaming && (
                                                <span style={{
                                                    display: 'inline-block', width: 8, height: 16,
                                                    background: '#8b5cf6', borderRadius: 2, marginLeft: 3,
                                                    animation: 'blink 1s step-end infinite'
                                                }} />
                                            )}
                                        </>
                                    ) : msg.content}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                    {formatTime(msg.ts)}
                                    {msg.role === 'assistant' && voiceEnabled && isSpeaking && msg === messages[messages.length - 1] && (
                                        <span style={{ marginLeft: 8, color: '#a78bfa' }}>🔊 Speaking...</span>
                                    )}
                                </div>
                            </div>

                            {/* User Avatar */}
                            {msg.role === 'user' && (
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4,
                                    fontWeight: 700, fontSize: '0.9rem'
                                }}>
                                    U
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '16px 24px 24px',
                background: 'rgba(0,0,0,0.3)',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(10px)',
                flexShrink: 0
            }}>
                {/* Voice status bar */}
                {supported && isListening && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
                            padding: '10px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '0.87rem'
                        }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                        Listening... {transcript && <em style={{ color: '#cbd5e1' }}>"{transcript}"</em>}
                    </motion.div>
                )}

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', maxWidth: 880, margin: '0 auto' }}>
                    {/* Mic button */}
                    {supported && (
                        <motion.button whileTap={{ scale: 0.93 }}
                            onClick={handleMic}
                            title={isListening ? 'Stop listening' : 'Speak to AI'}
                            style={{
                                width: 50, height: 50, flexShrink: 0,
                                background: isListening ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)',
                                border: `1px solid ${isListening ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                                borderRadius: 14, cursor: 'pointer', color: isListening ? '#fca5a5' : '#94a3b8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}>
                            {isListening ? <FaStop size={16} /> : <FaMicrophone size={16} />}
                        </motion.button>
                    )}

                    {/* Text input */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                            }}
                            placeholder={isListening ? '🎤 Listening...' : 'Ask me anything... (Enter to send, Shift+Enter for newline)'}
                            disabled={isListening}
                            rows={1}
                            style={{
                                width: '100%', background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(139,92,246,0.3)', borderRadius: 14,
                                padding: '14px 18px', color: 'white', fontSize: '0.93rem',
                                resize: 'none', outline: 'none', lineHeight: 1.5,
                                boxSizing: 'border-box', transition: 'border-color 0.2s',
                                minHeight: 50, maxHeight: 150, overflowY: 'auto',
                                fontFamily: 'inherit'
                            }}
                            onInput={e => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                            }}
                            onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                            onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.3)'}
                        />
                        <div style={{ position: 'absolute', bottom: 10, right: 12, color: '#475569', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FaKeyboard size={10} /> Shift+↵ newline
                        </div>
                    </div>

                    {/* Send / Stop */}
                    <motion.button whileTap={{ scale: 0.93 }}
                        onClick={isStreaming ? handleStop : sendMessage}
                        disabled={!isStreaming && !input.trim()}
                        style={{
                            width: 50, height: 50, flexShrink: 0,
                            background: isStreaming
                                ? 'rgba(239,68,68,0.3)'
                                : (input.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)'),
                            border: `1px solid ${isStreaming ? '#ef4444' : (input.trim() ? 'transparent' : 'rgba(255,255,255,0.1)')}`,
                            borderRadius: 14, cursor: (!isStreaming && !input.trim()) ? 'not-allowed' : 'pointer',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', opacity: (!isStreaming && !input.trim()) ? 0.4 : 1
                        }}>
                        {isStreaming ? <FaStop size={16} /> : <FaPaperPlane size={16} />}
                    </motion.button>
                </div>

                <div style={{ textAlign: 'center', marginTop: 10, color: '#334155', fontSize: '0.72rem' }}>
                    AI can make mistakes. Verify important code before using.
                </div>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.2)} }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #4c1d95; border-radius: 3px; }
      `}</style>
        </div>
    );
};

export default AIChatPage;
