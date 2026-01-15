import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor, { useMonaco } from '@monaco-editor/react';
import { FaPlay, FaVideo, FaGoogleDrive, FaCog, FaShareAlt, FaRobot, FaDownload, FaCopy, FaHistory, FaLock, FaBook } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../contexts/AuthContext';
import ChatPanel from './ChatPanel';
import ProblemPanel from './ProblemPanel';
import OutputPanel from './OutputPanel';
import SettingsModal from './SettingsModal';
import config from '../config';
import { SUPPORTED_LANGUAGES, SUPPORTED_THEMES, DEFAULT_EDITOR_SETTINGS } from '../constants';
import {
    incrementUserStats,
    logTransaction,
    subscribeToRoom,
    subscribeToMessages,
    subscribeToRoomMembers,
    subscribeToTyping,
    joinRoom,
    sendMessage,
    updateRoomCode,
    updateTypingStatus,
    updateUserStatus,
    addMessageReaction
} from '../services/firestoreService';

// Memoize sub-components to prevent re-renders on every keystroke
const MemoizedProblemPanel = React.memo(ProblemPanel);
const MemoizedChatPanel = React.memo(ChatPanel);
const MemoizedOutputPanel = React.memo(OutputPanel);

const CodeEditor = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Auth State
    const [isLocked, setIsLocked] = useState(false); // Can interpret private field from firestore later
    const [accessError, setAccessError] = useState('');

    const queryParams = new URLSearchParams(location.search);
    const initialQuestionId = queryParams.get('questionId');

    // State
    const [code, setCode] = useState('// Write your code here...');
    const [language, setLanguage] = useState(() => localStorage.getItem(`editor_language_${roomId}`) || 'javascript');
    const [theme, setTheme] = useState(() => localStorage.getItem(`editor_theme_${roomId}`) || 'vs-dark');
    const [editorSettings, setEditorSettings] = useState(() => {
        const saved = localStorage.getItem(`editor_settings_${roomId}`);
        return saved ? JSON.parse(saved) : DEFAULT_EDITOR_SETTINGS;
    });

    const [showSettings, setShowSettings] = useState(false);
    const [snapshots, setSnapshots] = useState([]);
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const lastSavedCodeRef = useRef(code);
    const lastTypeTimeRef = useRef(0);
    const isTypingRef = useRef(false);

    // Panels
    const [showChat, setShowChat] = useState(true);
    const [showInterview, setShowInterview] = useState(!!initialQuestionId);
    const [aiMode, setAiMode] = useState(false);

    // Real-time Data
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [currentTypingUsers, setCurrentTypingUsers] = useState([]);
    const [userRole, setUserRole] = useState('CANDIDATE');

    // For now assume everyone can edit if they have access
    const [permissions, setPermissions] = useState({ canEdit: true, canView: true, canEvaluate: false });
    const typingTimeoutRef = useRef(null);

    const editorRef = useRef(null);
    const monaco = useMonaco();

    // 1. Subscribe to Room Data (Metadata & Code)
    useEffect(() => {
        const unsubscribe = subscribeToRoom(roomId, (roomData) => {
            if (roomData) {
                // Determine if locked? For now assuming public or handling via firestore rules
                // if (roomData.isPrivate && ...) 

                // Update Code if changed remotely and we aren't typing furiously
                if (roomData.code && roomData.code !== lastSavedCodeRef.current) {
                    // Check if local code is significantly different or if we just typed
                    const timeSinceType = Date.now() - lastTypeTimeRef.current;
                    if (timeSinceType > 2000) {
                        setCode(roomData.code);
                        lastSavedCodeRef.current = roomData.code;
                    }
                }

                if (roomData.language && roomData.language !== language) {
                    setLanguage(roomData.language);
                }
            } else {
                setAccessError("Room not found");
                // navigate('/dashboard'); // Optional: redirect if invalid
            }
        });

        const unsubMessages = subscribeToMessages(roomId, setMessages);
        const unsubMembers = subscribeToRoomMembers(roomId, setParticipants);
        const unsubTyping = subscribeToTyping(roomId, (users) => {
            const myUserId = user?.username || 'Guest';
            setCurrentTypingUsers(users.filter(u => u !== myUserId));
        });

        // Join the room
        const myUser = user || { uid: 'guest_' + Math.floor(Math.random() * 1000), username: 'Guest' };
        joinRoom(roomId, myUser);

        return () => {
            unsubscribe();
            unsubMessages();
            unsubMembers();
            unsubTyping();
            // Optional: Leave room / mark offline
        };
    }, [roomId, user]); // Removed unnecessary deps

    // Heartbeat / Presence
    useEffect(() => {
        const myUserId = user?.id || user?.uid;
        if (!myUserId) return;

        const interval = setInterval(() => {
            updateUserStatus(roomId, myUserId, 'online');
        }, 30000); // 30s heartbeat

        return () => clearInterval(interval);
    }, [roomId, user]);


    // Auto-Save
    useEffect(() => {
        if (isLocked) return;
        const interval = setInterval(async () => {
            if (editorRef.current) {
                const currentCode = editorRef.current.getValue();
                // Save if changed locally
                if (currentCode !== lastSavedCodeRef.current) {
                    setIsSaving(true);
                    localStorage.setItem(`code_backup_${roomId}`, currentCode);

                    await updateRoomCode(roomId, currentCode, language);
                    lastSavedCodeRef.current = currentCode;

                    setTimeout(() => setIsSaving(false), 800);
                }
            }
        }, 2000); // Debounce save to 2s
        return () => clearInterval(interval);
    }, [roomId, isLocked, language]); // Added language dep to save lang changes too

    // Handlers
    const handleEditorChange = (value) => {
        setCode(value);
        lastTypeTimeRef.current = Date.now();
        localStorage.setItem(`code_backup_${roomId}`, value);
    };

    const handleRunCode = async () => {
        if (isRunning) return; // Prevent multiple simultaneous runs

        setIsRunning(true);
        setOutput([{ type: 'info', content: `⚡ Running ${language} code...` }]);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const res = await fetch(`${config.BACKEND_URL}/api/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    testCases: []
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await res.json();

            if (res.ok) {
                // Log transaction if user is logged in
                if (user?.id) {
                    incrementUserStats(user.id, 'execution');
                }

                const runResult = data.results && data.results.length > 0 ? data.results[0] : null;
                if (runResult) {
                    if (runResult.error) {
                        setOutput([
                            { type: 'error', content: '❌ Execution Error:' },
                            { type: 'error', content: runResult.error }
                        ]);
                    } else {
                        setOutput([
                            { type: 'success', content: '✅ Code Executed Successfully!' },
                            { type: 'info', content: '📤 Output:' },
                            { type: 'success', content: runResult.actual || '(No output)' }
                        ]);
                    }
                } else {
                    setOutput([{ type: 'info', content: '✅ Execution completed (No output)' }]);
                }
            } else {
                setOutput([
                    { type: 'error', content: '❌ Execution Failed' },
                    { type: 'error', content: data.detail || data.error || 'Server error occurred' }
                ]);
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                setOutput([{ type: 'error', content: '⏱️ Execution timeout (30s limit exceeded)' }]);
            } else {
                setOutput([
                    { type: 'error', content: '❌ Connection Error' },
                    { type: 'error', content: `${err.message}. Please ensure the backend is running.` }
                ]);
            }
        } finally {
            setIsRunning(false);
        }
    };

    const handleSettingsChange = (newSettings) => {
        setEditorSettings(newSettings);
        localStorage.setItem(`editor_settings_${roomId}`, JSON.stringify(newSettings));
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            alert("Code copied to clipboard!");
        } catch (err) { console.error("Failed to copy", err); }
    };

    const handleDownloadCode = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code_${roomId}.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt'}`;
        a.click();
    };

    const handleSaveSnapshot = () => {
        const snap = { id: Date.now(), code, timestamp: new Date().toLocaleString() };
        setSnapshots(prev => [snap, ...prev]);
        alert("Snapshot saved!");
    };

    useEffect(() => {
        if (snapshots.length > 5) setSnapshots(prev => prev.slice(0, 5));
    }, [snapshots]);

    const handleGoogleMeet = () => window.open('https://meet.google.com/new', '_blank');

    const handleSendMessage = async (text, type = 'TEXT', fileUrl = null, parentId = null) => {
        const finalType = aiMode ? 'AI_PROMPT' : type;
        const msgData = {
            userId: user?.username || 'Guest',
            content: text,
            type: finalType,
            fileUrl,
            parentId,
            // User avatar etc can be added here
            avatar: user?.photoURL || null
        };

        try {
            await sendMessage(roomId, msgData);

            if (user?.id && !aiMode && type === 'TEXT') {
                incrementUserStats(user.id, 'message');
            }

            if (aiMode && type === 'TEXT') {
                handleAskAI(text);
            }
        } catch (err) { console.error("Failed to send message", err); }
    };

    const handleAskAI = async (prompt) => {
        // Mocking AI response if backend is down or using generic one
        // because AI endpoint is also backend
        try {
            // Optimistic AI Pending
            // Note: We might not want to save 'Thinking...' to firestore, just local state?
            // But for shared AI chat, it should be in firestore. Let's just do final response.

            const res = await fetch(`${config.BACKEND_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, context: code })
            });

            if (!res.ok) throw new Error("AI Backend Unavailable");
            const data = await res.json();
            const aiResponse = typeof data.response === 'object' ? JSON.stringify(data.response) : String(data.response || '');

            await sendMessage(roomId, {
                userId: 'Gemini AI',
                content: aiResponse,
                type: 'AI_RESPONSE'
            });

        } catch (err) {
            await sendMessage(roomId, {
                userId: 'System',
                content: `AI Error: ${err.message}`,
                type: 'TEXT'
            });
        }
    };

    const handleAIExplain = async () => {
        const model = editorRef.current.getModel();
        const selection = editorRef.current.getSelection();
        const selectedCode = model.getValueInRange(selection) || code;
        handleAskAI(`Explain this code:\n${selectedCode}`);
        setShowChat(true);
        setAiMode(true);
    };

    const handleTyping = async () => {
        const myUserId = user?.username || 'Guest';
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        await updateTypingStatus(roomId, myUserId, true);

        typingTimeoutRef.current = setTimeout(async () => {
            await updateTypingStatus(roomId, myUserId, false);
        }, 2000);
    };

    const handleReaction = async (msgId, emoji) => {
        if (!user) return;
        try {
            if (msgId) {
                await addMessageReaction(roomId, String(msgId), emoji, user.username || user.uid);
            }
        }
        } catch (err) {
        console.error("Failed to add reaction", err);
    }
};

if (isLocked) {
    return (
        // Lock Screen (Simplified, as password logic requires valid backend usually)
        // We can assume open for now or check roomData.password in firestore
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <h2>Room Locked</h2>
                <p>Please contact room owner.</p>
            </div>
        </div>
    );
}

return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', color: 'white' }}>
        {/* Toolbar */}
        <div style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', background: '#1e293b' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="logo" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>CodeConnect</div>

                {/* Room ID Badge */}
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                    Room: {roomId}
                </div>

                <div style={{ height: '24px', width: '1px', background: '#475569' }}></div>

                {/* Language Selector */}
                <select
                    value={language}
                    onChange={(e) => {
                        const newLang = e.target.value;
                        setLanguage(newLang);
                        localStorage.setItem(`editor_language_${roomId}`, newLang);
                        // Also update remote
                        updateRoomCode(roomId, code, newLang);
                    }}
                    style={{ background: '#334155', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', outline: 'none' }}
                >
                    {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                </select>

                {/* Theme Selector */}
                <select
                    value={theme}
                    onChange={(e) => {
                        const newTheme = e.target.value;
                        setTheme(newTheme);
                        localStorage.setItem(`editor_theme_${roomId}`, newTheme);
                    }}
                    style={{ background: '#334155', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', outline: 'none' }}
                >
                    {SUPPORTED_THEMES.map(theme => (
                        <option key={theme.id} value={theme.id}>{theme.name}</option>
                    ))}
                </select>

                <div style={{ height: '24px', width: '1px', background: '#475569' }}></div>

                <button
                    className="btn"
                    style={{
                        display: 'flex',
                        gap: '6px',
                        background: isRunning ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                        color: 'white',
                        border: '1px solid #475569',
                        cursor: isRunning ? 'not-allowed' : 'pointer',
                        opacity: isRunning ? 0.7 : 1
                    }}
                    onClick={handleRunCode}
                    disabled={isRunning}
                >
                    <FaPlay color="#10b981" style={{ animation: isRunning ? 'pulse 1s infinite' : 'none' }} />
                    {isRunning ? 'Running...' : 'Run'}
                </button>
                <button className="btn" style={{ display: 'flex', gap: '6px', background: 'transparent', color: 'white', border: '1px solid #475569' }} onClick={handleGoogleMeet} title="Start Google Meet"><FaVideo /> Meet</button>
                <button className="btn" style={{ display: 'flex', gap: '6px', background: 'transparent', color: 'white', border: '1px solid #475569' }} onClick={() => setShowSettings(true)} title="Settings"><FaCog /></button>

                <div style={{ fontSize: '0.8rem', color: isSaving ? '#facc15' : '#94a3b8', fontStyle: 'italic', minWidth: '60px' }}>
                    {isSaving ? 'Saving...' : 'Saved'}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button className="btn icon-btn" onClick={handleAIExplain} title="Explain with AI" style={{ color: '#8b5cf6', background: 'transparent', border: 'none' }}><FaRobot /> Explain</button>
                <button className="btn icon-btn" onClick={() => {
                    const model = editorRef.current.getModel();
                    const selection = editorRef.current.getSelection();
                    const selectedCode = model.getValueInRange(selection) || code;
                    handleAskAI(`Find bugs and suggest fixes for this code:\n${selectedCode}`);
                    setShowChat(true);
                    setAiMode(true);
                }} title="Debug with AI" style={{ color: '#ef4444', background: 'transparent', border: 'none' }}><FaRobot /> Debug</button>

                <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn" onClick={handleDownloadCode} title="Download File" style={{ background: 'transparent', border: 'none', color: 'white' }}><FaDownload /></button>
                    <button className="btn" onClick={handleCopyCode} title="Copy to Clipboard" style={{ background: 'transparent', border: 'none', color: 'white' }}><FaCopy /></button>
                    <button className="btn" onClick={handleSaveSnapshot} title="Save Snapshot" style={{ background: 'transparent', border: 'none', color: 'white' }}><FaHistory /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', fontSize: '0.8rem' }}>
                    <span style={{ color: '#94a3b8' }}>Participants: {participants.length}</span>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Left Panel */}
            <motion.div
                initial={{ width: 350, opacity: 1 }}
                animate={{ width: showInterview ? 350 : 0, opacity: showInterview ? 1 : 0 }}
                style={{ borderRight: '1px solid #334155', display: showInterview ? 'block' : 'none', background: '#1e293b' }}
            >
                <MemoizedProblemPanel
                    socket={null}
                    roomId={roomId}
                    onPostQuestion={(text) => setCode(prev => text + prev)}
                    questionId={initialQuestionId}
                    isOpen={showInterview}
                    onClose={() => setShowInterview(false)}
                />
            </motion.div>

            {/* Center Panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {userRole === 'INTERVIEWER' && (
                    <div style={{ background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        🎯 INTERVIEWER MODE - Read-Only View
                    </div>
                )}

                <Editor
                    height="100%"
                    theme={theme}
                    language={language}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={(editor) => { editorRef.current = editor; }}
                    options={{
                        minimap: { enabled: editorSettings.minimap !== false },
                        fontSize: editorSettings.fontSize,
                        fontFamily: editorSettings.fontFamily || 'Consolas, "Courier New", monospace',
                        wordWrap: editorSettings.wordWrap,
                        lineNumbers: editorSettings.lineNumbers,
                        tabSize: editorSettings.tabSize,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: !permissions.canEdit,
                        domReadOnly: !permissions.canEdit,

                        // Autocomplete & IntelliSense
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: {
                            other: true,
                            comments: true,
                            strings: true
                        },
                        parameterHints: {
                            enabled: true
                        },
                        suggestSelection: 'first',
                        acceptSuggestionOnCommitCharacter: true,
                        acceptSuggestionOnEnter: 'on',
                        snippetSuggestions: 'top',
                        wordBasedSuggestions: true,

                        // Code Formatting
                        formatOnPaste: true,
                        formatOnType: true,
                        autoIndent: 'full',

                        // Bracket Features
                        bracketPairColorization: {
                            enabled: editorSettings.bracketPairColorization !== false
                        },
                        guides: {
                            bracketPairs: true,
                            indentation: true
                        },

                        // Additional helpful features
                        hover: {
                            enabled: true
                        },
                        lightbulb: {
                            enabled: true
                        },
                        codeLens: true,
                        folding: true,
                        foldingStrategy: 'indentation',
                        showFoldingControls: 'always',
                        matchBrackets: 'always',
                        autoClosingBrackets: 'always',
                        autoClosingQuotes: 'always',
                        autoSurround: 'languageDefined',
                    }}
                />

                <MemoizedOutputPanel
                    isOpen={output.length > 0}
                    output={output}
                    onClose={() => setOutput([])}
                    isRunning={isRunning}
                />

                <SettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                    settings={editorSettings}
                    onSettingsChange={handleSettingsChange}
                />
            </div>

            {/* Right Panel */}
            <motion.div
                initial={{ width: 320, opacity: 1 }}
                animate={{ width: showChat ? 320 : 0, opacity: showChat ? 1 : 0 }}
                style={{ borderLeft: '1px solid #334155', display: showChat ? 'block' : 'none', background: '#1e293b' }}
            >
                <div style={{ padding: '10px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Chat & AI</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => setAiMode(!aiMode)} style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '12px', background: aiMode ? 'linear-gradient(45deg, #8b5cf6, #ec4899)' : 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer' }}>{aiMode ? 'AI ON 🤖' : 'AI OFF'}</button>
                        <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: 'white' }}><FaShareAlt /></button>
                    </div>
                </div>
                <div style={{ height: 'calc(100% - 50px)' }}>
                    <MemoizedChatPanel
                        socket={null}
                        roomId={roomId}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        onReaction={handleReaction}
                        isOpen={true}
                        currentTypingUsers={currentTypingUsers}
                        onTyping={handleTyping}
                        aiMode={aiMode}
                        setAiMode={setAiMode}
                    />
                </div>
            </motion.div>
        </div>

        <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '10px', zIndex: 100 }}>
            {initialQuestionId && !showInterview && <button onClick={() => setShowInterview(true)} className="btn primary-btn" style={{ borderRadius: '50%', padding: '10px' }}><FaBook /></button>}
            {!showChat && <button onClick={() => setShowChat(true)} className="btn primary-btn" style={{ borderRadius: '50%', padding: '10px' }}><FaShareAlt style={{ transform: 'scaleX(-1)' }} /></button>}
        </div>
    </div>
);
};

export default CodeEditor;
