import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor, { useMonaco } from '@monaco-editor/react';
import { FaPlay, FaVideo, FaGoogleDrive, FaCog, FaComments, FaRobot, FaDownload, FaCopy, FaHistory, FaLock, FaBook, FaBars, FaPencilAlt, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './Editor.css';

import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ChatPanel from './ChatPanel';
import ProblemPanel from './ProblemPanel';
import OutputPanel from './OutputPanel';
import SettingsModal from './SettingsModal';
import Whiteboard from './Whiteboard';
import config from '../config';
import useRoomMessages from '../hooks/useRoomMessages'; // Hooks updated to use API/Socket
import { SUPPORTED_LANGUAGES, SUPPORTED_THEMES, DEFAULT_EDITOR_SETTINGS } from '../constants';

// Services
import realtimeService from '../services/realtimeService';
import { getRoom } from '../services/apiService';

// Memoize sub-components to prevent re-renders on every keystroke
const MemoizedProblemPanel = React.memo(ProblemPanel);
const MemoizedChatPanel = React.memo(ChatPanel);
const MemoizedOutputPanel = React.memo(OutputPanel);

const CodeEditor = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, login } = useAuth();
    const { toast } = useToast(); // Initialize toast hook

    // Auth State
    const [isLocked, setIsLocked] = useState(false);
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
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [aiMode, setAiMode] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Adjust defaults for mobile
    useEffect(() => {
        if (isMobile) {
            setShowChat(false);
            setShowInterview(false);
        }
    }, [isMobile]);

    // Real-time Data
    const [participants, setParticipants] = useState([]);
    const messages = useRoomMessages(roomId);
    const [currentTypingUsers, setCurrentTypingUsers] = useState([]);
    const [whiteboardDrawings, setWhiteboardDrawings] = useState([]);
    const [userRole, setUserRole] = useState('CANDIDATE');

    // For now assume everyone can edit if they have access
    const [permissions, setPermissions] = useState({ canEdit: true, canView: true, canEvaluate: false });
    const typingTimeoutRef = useRef(null);

    const editorRef = useRef(null);
    const monaco = useMonaco();

    // 1. Join Room & Subscribe to Changes via Firestore
    useEffect(() => {
        if (!roomId) return;

        // Join room logic
        let myUser = user;
        if (!myUser) {
            const guestName = localStorage.getItem('codeconnect_guest_name') || 'Guest';
            myUser = { uid: 'guest_' + Math.floor(Math.random() * 10000), username: guestName };
        }
        realtimeService.joinRoom(roomId, myUser);

        // Initial Data Fetch via API (for robust loading state)
        const fetchInitialData = async () => {
            try {
                const roomData = await getRoom(roomId);
                if (roomData) {
                    if (roomData.code) {
                        setCode(roomData.code);
                        lastSavedCodeRef.current = roomData.code;
                    }
                    if (roomData.language) setLanguage(roomData.language);
                }
            } catch (err) {
                console.error("Error fetching room:", err);
                setAccessError("Room not found or access denied");
            }
        };
        fetchInitialData();

        // Listen for Code Updates
        const unsubscribeCode = realtimeService.onCodeChange(roomId, ({ code: newCode, language: newLang }) => {
            if (newCode && newCode !== lastSavedCodeRef.current) {
                const timeSinceType = Date.now() - lastTypeTimeRef.current;
                if (timeSinceType > 2000) {
                    setCode(newCode);
                    lastSavedCodeRef.current = newCode;
                }
            }
            if (newLang && newLang !== language) {
                setLanguage(newLang);
            }
        });

        // Listen for Typing Status
        const unsubscribeTyping = realtimeService.onTyping(roomId, (data) => {
            const { isTyping, user: typingUser } = data;
            if (isTyping) {
                setCurrentTypingUsers(prev => [...prev.filter(u => u !== typingUser), typingUser]);
            } else {
                setCurrentTypingUsers(prev => prev.filter(u => u !== typingUser));
            }
        });

        // Listen for Whiteboard Draws
        const unsubscribeDraw = realtimeService.onDraw(roomId, (data) => {
            if (data.type === 'clear') {
                setWhiteboardDrawings([]);
            } else {
                setWhiteboardDrawings(prev => [...prev, data]);
            }
        });

        return () => {
            if (unsubscribeCode) unsubscribeCode();
            if (unsubscribeTyping) unsubscribeTyping();
            if (unsubscribeDraw) unsubscribeDraw();
            realtimeService.disconnect();
        };
    }, [roomId, user]);


    // Auto-Save (Via Socket)
    useEffect(() => {
        if (isLocked) return;
        const interval = setInterval(() => {
            if (editorRef.current) {
                const currentCode = editorRef.current.getValue();
                // Save if changed locally
                if (currentCode !== lastSavedCodeRef.current) {
                    setIsSaving(true);

                    // Send update via Firestore
                    realtimeService.sendCodeChange(roomId, { code: currentCode, language });

                    lastSavedCodeRef.current = currentCode;
                    localStorage.setItem(`code_backup_${roomId}`, currentCode);

                    setTimeout(() => setIsSaving(false), 800);
                }
            }
        }, 2000); // 2s debounce
        return () => clearInterval(interval);
    }, [roomId, isLocked, language]);

    // Handlers
    const handleEditorChange = (value) => {
        setCode(value);
        lastTypeTimeRef.current = Date.now();
        localStorage.setItem(`code_backup_${roomId}`, value);
        // Socket emit handled by auto-save effect or we can emit here throttled
        // Auto-save effect handles it every 2s, but for smoother typing we might want throttling here.
        // For simplicity, rely on the useEffect for 'save' and let the local state drive the UI.
    };

    const handleRunCode = async () => {
        if (isRunning) return;

        // Save current code via API before running
        try {
            // Optional: Explicitly save before run
            // await updateCode(roomId, code, language); 
            // The auto-save might handle it, but for safety in run we can assume local is fresh
        } catch (err) {
            console.error("Failed to save code before execution:", err);
        }

        setIsRunning(true);
        setOutput([{ type: 'info', content: `⚡ Running ${language} code...` }]);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

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
                // Log transaction
                // incrementUserStats(user.id, 'execution'); // TODO: Add this to API service

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

    const handleSubmitSolution = async () => {
        if (isRunning || !initialQuestionId) return;

        setIsRunning(true);
        setOutput([{ type: 'info', content: `🤖 Submitting and Verifying ${language} solution...` }]);

        try {
            const ProblemService = (await import('../services/problemService')).default;

            const teamChallengeId = queryParams.get('teamChallengeId');

            const result = await ProblemService.submitSolution({
                problemId: initialQuestionId,
                code,
                language,
                userId: user?.id || user?.uid || 'guest',
                userName: user?.username || 'Guest',
                roomId,
                teamChallengeId
            });

            if (result.success) {
                const tests = result.testResults;
                const ai = result.aiVerification;
                const score = ai?.score || (tests.allPassed ? 100 : 0);

                const outputLines = [
                    { type: 'success', content: `✅ Solution Accepted! Score: ${score}/100` },
                    { type: 'info', content: `📊 Test Cases: ${tests.passed}/${tests.totalTests} Passed` },
                    { type: 'info', content: `⏱️ Time: ${tests.executionTime} | 💾 Memory: ${tests.memoryUsage || 'N/A'}` }
                ];

                if (ai && ai.feedbacks) {
                    outputLines.push({ type: 'info', content: '--- AI Feedback ---' });
                    ai.feedbacks.forEach(f => {
                        outputLines.push({ type: f.type === 'Error' ? 'error' : 'info', content: `• ${f.type}: ${f.message}` });
                    });
                }

                if (ai && ai.timeComplexity) {
                    outputLines.push({ type: 'info', content: `📈 Time: ${ai.timeComplexity} | Space: ${ai.spaceComplexity}` });
                }

                setOutput(outputLines);
                toast.success(`Solution Correct! Score: ${score}`);
            } else {
                const tests = result.testResults;
                const errorLines = [
                    { type: 'error', content: '❌ Solution Rejected' },
                    { type: 'error', content: `Failed ${tests.failedTests} test cases.` }
                ];

                const firstFail = tests.cases?.find(c => !c.passed);
                if (firstFail) {
                    errorLines.push({ type: 'error', content: `Failed Input: ${JSON.stringify(firstFail.input)}` });
                    errorLines.push({ type: 'error', content: `Expected: ${firstFail.expectedOutput}` });
                    errorLines.push({ type: 'error', content: `Actual: ${firstFail.actualOutput}` });
                    if (firstFail.error) errorLines.push({ type: 'error', content: `Error: ${firstFail.error}` });
                }

                if (result.aiVerification?.feedbacks) {
                    errorLines.push({ type: 'info', content: '--- AI Hints ---' });
                    result.aiVerification.feedbacks.forEach(f => {
                        errorLines.push({ type: 'info', content: `• ${f.message}` });
                    });
                }

                setOutput(errorLines);
                toast.error('Solution Incorrect. Check output for details.');
            }

        } catch (err) {
            console.error("Submission error:", err);
            setOutput([
                { type: 'error', content: '❌ Submission Failed' },
                { type: 'error', content: err.message || 'Server error during verification' }
            ]);
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

    // Chat / Socket Messages
    const handleSendMessage = async (text, type = 'TEXT', fileUrl = null, parentId = null, extraData = {}) => {
        const finalType = aiMode ? 'AI_PROMPT' : type;
        const msgData = {
            userId: extraData.userId || user?.uid || user?.username || 'Guest',
            content: text,
            type: finalType,
            fileUrl,
            parentId,
            avatar: extraData.avatar || user?.photoURL || null,
            senderName: extraData.senderName || user?.username || user?.displayName || 'Guest'
        };

        try {
            // If AI Prompt, we might still want to broadcast it so user sees their question
            // For now, let's treat AI chat as local or API-based, not socket broadcast unless logical
            if (aiMode) {
                handleAskAI(text);
                return; // Don't broadcast AI prompts to room for now, or maybe yes?
                // If it's a collaborative AI, we should. But let's stick to API for AI.
            }

            if (text.trim() || msgData.type !== 'TEXT') {
                realtimeService.sendMessage(roomId, msgData);
            }

            // Stats handled by backend or not critical
        } catch (err) { console.error("Failed to send message", err); }
    };

    const handleAskAI = async (prompt) => {
        try {
            // Add user message to UI immediately (ChatPanel typically listens to 'messages' array)
            // Since we aren't broadcasting AI prompts via socket, we might need to manually update local messages
            // OR we just broadcast them with type 'AI_PROMPT' and everyone sees it.
            // Let's broadcast it for collaborative feel.
            const msgData = {
                userId: user?.username || 'Guest',
                content: prompt,
                type: 'AI_PROMPT',
                senderName: user?.username || 'Guest'
            };
            realtimeService.sendMessage(roomId, msgData);

            const res = await fetch(`${config.BACKEND_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, context: code })
            });

            if (!res.ok) throw new Error("AI Backend Unavailable");
            const data = await res.json();
            const aiResponse = typeof data.response === 'object' ? JSON.stringify(data.response) : String(data.response || '');

            // Broadcast AI Response
            realtimeService.sendMessage(roomId, {
                userId: 'Gemini AI',
                content: aiResponse,
                type: 'AI_RESPONSE',
                senderName: 'Gemini AI'
            });

        } catch (err) {
            realtimeService.sendMessage(roomId, {
                userId: 'System',
                content: `AI Error: ${err.message}`,
                type: 'TEXT',
                senderName: 'System'
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

        realtimeService.sendTyping(roomId, { user: myUserId, isTyping: true });

        typingTimeoutRef.current = setTimeout(async () => {
            realtimeService.sendTyping(roomId, { user: myUserId, isTyping: false });
        }, 2000);
    };

    const handleReaction = async (msgId, emoji) => {
        try {
            realtimeService.sendReaction(roomId, msgId, emoji);
        } catch (err) {
            console.error("Failed to send reaction:", err);
        }
    };

    const handleAddDrawing = async (action) => {
        try {
            realtimeService.sendDraw(roomId, action);
        } catch (err) {
            console.error("Failed to add drawing:", err);
        }
    };

    const handleEndSession = async () => {
        if (window.confirm("Are you sure you want to end this session?")) {
            try {
                // await cleanupRoomData(roomId); 
                // socketService.emit('end-room', roomId);
                navigate('/dashboard');
            } catch (err) {
                console.error("Error ending session:", err);
                navigate('/dashboard');
            }
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
        <div className="editor-container">
            {/* Toolbar */}
            <div className="editor-toolbar" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: isMobile ? '0.25rem' : '1rem',
                padding: isMobile ? '0.5rem' : '0.8rem',
                minHeight: isMobile ? '44px' : '50px',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div className="editor-toolbar-left">
                    {!isMobile && (
                        <>
                            <div className="editor-logo" onClick={() => navigate('/dashboard')}>CodeConnect</div>

                            {/* Room ID Badge */}
                            <div className="editor-room-badge">
                                Room: {roomId}
                            </div>

                            <div className="toolbar-separator"></div>

                            {/* Participants Badge */}
                            <div className="editor-room-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: '1px solid #3b82f6' }}>
                                <span style={{ marginRight: '6px' }}>👥</span>
                                {participants.length || 1} Online
                            </div>

                            <div className="toolbar-separator"></div>

                            {/* Language Selector */}
                            <select
                                value={language}
                                onChange={(e) => {
                                    const newLang = e.target.value;
                                    setLanguage(newLang);
                                    localStorage.setItem(`editor_language_${roomId}`, newLang);

                                    // Language Template Logic
                                    const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.id === language);
                                    const newLangObj = SUPPORTED_LANGUAGES.find(l => l.id === newLang);

                                    const isDefaultTemplate = currentLangObj && code.trim() === currentLangObj.template?.trim();
                                    const isEmpty = !code || code.trim() === '' || code === '// Write your code here...';

                                    let newCode = code;
                                    if (isEmpty || isDefaultTemplate) {
                                        newCode = newLangObj?.template || '';
                                        setCode(newCode);
                                    }

                                    // Broadcast change
                                    socketService.sendCodeChange(roomId, { code: newCode, language: newLang });
                                }}
                                style={{
                                    background: '#334155',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    width: 'auto',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {SUPPORTED_LANGUAGES.map(lang => (
                                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                                ))}
                            </select>
                        </>
                    )}

                    {!isMobile && (
                        <>
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
                            <div className="toolbar-separator"></div>
                        </>
                    )}


                    <button
                        className="btn"
                        style={{
                            display: 'flex',
                            gap: '6px',
                            background: isRunning ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: 'white',
                            border: '1px solid #475569',
                            cursor: isRunning ? 'not-allowed' : 'pointer',
                            opacity: isRunning ? 0.7 : 1,
                            minHeight: '40px',
                            minWidth: isMobile ? '40px' : 'auto',
                            padding: isMobile ? '0.4rem' : '0.6rem 1rem',
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={handleRunCode}
                        disabled={isRunning}
                    >
                        <FaPlay color="#10b981" style={{ animation: isRunning ? 'pulse 1s infinite' : 'none' }} />
                        <span className={isMobile ? "hide-mobile" : ""}>{isRunning ? 'Running...' : 'Run'}</span>
                    </button>

                    {showInterview && (
                        <button
                            className="btn"
                            style={{
                                display: 'flex',
                                gap: '6px',
                                background: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                                border: '1px solid #3b82f6',
                                cursor: isRunning ? 'not-allowed' : 'pointer',
                                opacity: isRunning ? 0.7 : 1,
                                minHeight: '40px',
                                minWidth: isMobile ? '40px' : 'auto',
                                padding: isMobile ? '0.4rem' : '0.6rem 1rem',
                                fontSize: isMobile ? '0.75rem' : '0.875rem',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={handleSubmitSolution}
                            disabled={isRunning}
                        >
                            <FaRobot />
                            <span className={isMobile ? "hide-mobile" : ""}>Submit</span>
                        </button>
                    )}
                </div>

                <div className="editor-toolbar-right">
                    {/* Desktop Actions */}
                    <div className="hide-mobile-only" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn" style={{ display: 'flex', gap: '6px', background: 'transparent', color: 'white', border: '1px solid #475569' }} onClick={handleDownloadCode} title="Save to Device"><FaGoogleDrive /> Save</button>
                        <button className="btn" style={{ display: 'flex', gap: '6px', background: 'transparent', color: 'white', border: '1px solid #475569' }} onClick={handleGoogleMeet} title="Start Google Meet"><FaVideo /> Meet</button>
                        <button className="btn icon-btn" onClick={handleAIExplain} title="Explain with AI" style={{ color: '#8b5cf6', background: 'transparent', border: 'none' }}><FaRobot /> Explain</button>
                    </div>

                    {/* Panel Toggles */}
                    <button
                        className={`btn ${showInterview ? 'active' : ''}`}
                        onClick={() => setShowInterview(!showInterview)}
                        title="Toggle Problem Panel"
                        style={{ background: showInterview ? 'rgba(59, 130, 246, 0.2)' : 'transparent', border: '1px solid #475569', color: 'white' }}
                    >
                        <FaBook />
                    </button>

                    <button
                        className={`btn ${showWhiteboard ? 'active' : ''}`}
                        onClick={() => setShowWhiteboard(!showWhiteboard)}
                        title="Toggle Whiteboard"
                        style={{ background: showWhiteboard ? 'rgba(139, 92, 246, 0.2)' : 'transparent', border: '1px solid #475569', color: 'white' }}
                    >
                        <FaPencilAlt />
                    </button>

                    <button
                        className={`btn ${showChat ? 'active' : ''}`}
                        onClick={() => setShowChat(!showChat)}
                        title="Toggle Chat"
                        style={{ background: showChat ? 'rgba(59, 130, 246, 0.2)' : 'transparent', border: '1px solid #475569', color: 'white' }}
                    >
                        <FaComments />
                    </button>

                    <div style={{ width: '1px', height: '20px', background: '#334155', margin: '0 4px' }}></div>

                    <button
                        className="btn"
                        onClick={handleEndSession}
                        title="End Session & Clear Data"
                        style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444' }}
                    >
                        <FaTimes /> <span className="hide-mobile-only" style={{ marginLeft: '4px' }}>End Session</span>
                    </button>

                    {/* Desktop Settings */}
                    <button
                        className="btn hide-mobile-only"
                        style={{ display: 'flex', gap: '6px', background: 'transparent', color: 'white', border: '1px solid #475569' }}
                        onClick={() => setShowSettings(true)}
                        title="Settings"
                    >
                        <FaCog />
                    </button>

                    {/* Mobile Menu Toggle - Always rendered, hidden on desktop via CSS */}
                    <button
                        className="btn show-mobile-only"
                        style={{
                            display: 'flex',
                            gap: '6px',
                            background: 'transparent',
                            color: 'white',
                            border: '1px solid #475569',
                            marginLeft: '5px'
                        }}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        title="Menu"
                    >
                        <FaBars />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="editor-main">
                {/* Left Panel - Desktop */}
                {!isMobile && showInterview && (
                    <motion.div
                        className="editor-sidebar-left"
                        initial={{ width: 350, opacity: 1 }}
                        animate={{ width: 350, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
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
                )}

                {/* Center Panel */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    {userRole === 'INTERVIEWER' && (
                        <div style={{ background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            🎯 INTERVIEWER MODE - Read-Only View
                        </div>
                    )}

                    <div className="editor-code-wrapper">
                        <Editor
                            height="100%"
                            theme={theme}
                            language={language}
                            value={code}
                            onChange={handleEditorChange}
                            onMount={(editor) => { editorRef.current = editor; }}
                            options={{
                                minimap: { enabled: editorSettings.minimap !== false && !isMobile }, // Disable minimap on mobile
                                fontSize: editorSettings.fontSize,
                                fontFamily: editorSettings.fontFamily || 'Consolas, "Courier New", monospace',
                                wordWrap: editorSettings.wordWrap,
                                lineNumbers: editorSettings.lineNumbers,
                                tabSize: editorSettings.tabSize,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                readOnly: !permissions.canEdit,
                                domReadOnly: !permissions.canEdit,
                                suggestOnTriggerCharacters: true,
                                quickSuggestions: { other: true, comments: true, strings: true },
                                parameterHints: { enabled: true },
                                suggestSelection: 'first',
                                acceptSuggestionOnCommitCharacter: true,
                                acceptSuggestionOnEnter: 'on',
                                snippetSuggestions: 'top',
                                wordBasedSuggestions: true,
                                formatOnPaste: true,
                                formatOnType: true,
                                autoIndent: 'full',
                                bracketPairColorization: { enabled: editorSettings.bracketPairColorization !== false },
                                guides: { bracketPairs: true, indentation: true },
                                hover: { enabled: true },
                                lightbulb: { enabled: true },
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
                    </div>

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

                {/* Right Panel - Desktop */}
                {!isMobile && showChat && (
                    <motion.div
                        className="editor-sidebar-right"
                        initial={{ width: 320, opacity: 1 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                    >
                        <div style={{ height: '100%' }}>
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
                                onClose={() => setShowChat(false)}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Whiteboard Panel - Desktop */}
                {!isMobile && showWhiteboard && (
                    <motion.div
                        className="editor-sidebar-right"
                        initial={{ width: 400, opacity: 1 }}
                        animate={{ width: 400, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                    >
                        <Whiteboard
                            roomId={roomId}
                            isOpen={showWhiteboard}
                            onClose={() => setShowWhiteboard(false)}
                            onAddDrawing={handleAddDrawing}
                            drawings={whiteboardDrawings}
                        />
                    </motion.div>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobile && isMobileMenuOpen && (
                    <motion.div
                        className="mobile-menu-overlay"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            position: 'fixed', top: '60px', right: '10px', width: '200px',
                            background: '#1e293b', border: '1px solid #475569', borderRadius: '8px',
                            zIndex: 1000, padding: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Header Info */}
                            <div style={{ paddingBottom: '10px', borderBottom: '1px solid #334155' }}>
                                <div onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }} style={{ fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px', cursor: 'pointer' }}>CodeConnect</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Room: {roomId}</div>
                                <div style={{ fontSize: '0.8rem', color: isSaving ? '#fbbf24' : '#4ade80' }}>
                                    {isSaving ? 'Saving...' : 'Saved'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                                    Participants: {participants.length || 1}
                                </div>
                            </div>

                            {/* Selectors */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <select
                                    value={language}
                                    onChange={(e) => {
                                        const newLang = e.target.value;
                                        setLanguage(newLang);
                                        localStorage.setItem(`editor_language_${roomId}`, newLang);

                                        // Language Template Logic
                                        const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.id === language);
                                        const newLangObj = SUPPORTED_LANGUAGES.find(l => l.id === newLang);

                                        const isDefaultTemplate = currentLangObj && code.trim() === currentLangObj.template?.trim();
                                        const isEmpty = !code || code.trim() === '' || code === '// Write your code here...';

                                        if (isEmpty || isDefaultTemplate) {
                                            const newCode = newLangObj?.template || '';
                                            setCode(newCode);
                                            socketService.sendCodeChange(roomId, { code: newCode, language: newLang });
                                        } else {
                                            socketService.sendCodeChange(roomId, { code, language: newLang });
                                        }
                                    }}
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#334155', color: 'white', border: 'none' }}
                                >
                                    {SUPPORTED_LANGUAGES.map(lang => (
                                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                                    ))}
                                </select>

                                <select
                                    value={theme}
                                    onChange={(e) => {
                                        setTheme(e.target.value);
                                        localStorage.setItem(`editor_theme_${roomId}`, e.target.value);
                                    }}
                                    style={{ width: '100%', padding: '6px', borderRadius: '4px', background: '#334155', color: 'white', border: 'none' }}
                                >
                                    {SUPPORTED_THEMES.map(theme => (
                                        <option key={theme.id} value={theme.id}>{theme.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ borderTop: '1px solid #334155', margin: '5px 0' }}></div>

                            {/* Actions */}
                            <button className="btn" onClick={() => { handleRunCode(); setIsMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981' }}>
                                <FaPlay /> Run Code
                            </button>

                            <button className="btn" onClick={() => { handleGoogleMeet(); setIsMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start', background: 'transparent', color: 'white' }}>
                                <FaVideo /> Meet
                            </button>

                            <button className="btn" onClick={() => { handleAIExplain(); setIsMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start', background: 'transparent', color: '#8b5cf6' }}>
                                <FaRobot /> Explain
                            </button>

                            <button className="btn" onClick={() => { handleDownloadCode(); setIsMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start', background: 'transparent', color: '#34d399' }}>
                                <FaGoogleDrive /> Save to Drive
                            </button>

                            <button className="btn" onClick={() => { setShowSettings(true); setIsMobileMenuOpen(false); }} style={{ justifyContent: 'flex-start', background: 'transparent', color: 'white' }}>
                                <FaCog /> Settings
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Overlays - Chat & Problem */}
            <AnimatePresence>
                {isMobile && showInterview && (
                    <motion.div
                        className="editor-overlay"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                    >
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '10px', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold' }}>Problem</span>
                                <button onClick={() => setShowInterview(false)} className="btn" style={{ background: 'transparent', border: 'none', color: 'white' }}>Close</button>
                            </div>
                            <MemoizedProblemPanel
                                socket={null}
                                roomId={roomId}
                                onPostQuestion={(text) => setCode(prev => text + prev)}
                                questionId={initialQuestionId}
                                isOpen={showInterview}
                                onClose={() => setShowInterview(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isMobile && showWhiteboard && (
                    <motion.div
                        className="editor-overlay"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                    >
                        <Whiteboard
                            roomId={roomId}
                            isOpen={showWhiteboard}
                            onClose={() => setShowWhiteboard(false)}
                            onAddDrawing={handleAddDrawing}
                            drawings={whiteboardDrawings}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isMobile && showChat && (
                    <motion.div
                        className="editor-overlay"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                    >
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {/* Chat Panel usually has its own header, but we ensure it fits */}
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
                                onClose={() => setShowChat(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default CodeEditor;
