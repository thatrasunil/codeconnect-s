import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaPlus, FaLaptopCode, FaChartPie, FaHistory, FaProjectDiagram, 
    FaTrophy, FaCode, FaBrain, FaArrowRight, FaBug, FaVial, 
    FaMagic, FaTerminal, FaUserAstronaut, FaKeyboard, FaSearch, 
    FaWindowClose, FaPlay, FaSyncAlt, FaRobot, FaFire,
    FaLock, FaCheckCircle, FaPause, FaRedo, FaInfoCircle,
    FaArrowAltCircleRight, FaCompass, FaMeteor, FaHourglassHalf
} from 'react-icons/fa';
import RoomChoiceModal from '../components/RoomChoiceModal';
import OnlineUsersModal from '../components/OnlineUsersModal';
import LoadingSpinner from '../components/LoadingSpinner';

import config from '../config';
import socketService from '../services/socketService';
import './Dashboard.css';

import {
    createRoom,
    fetchUserRooms,
    getLeaderboard,
    getDashboardStats,
    fetchPublicRooms
} from '../services/apiService';

const CHALLENGES = [
    {
        title: "Reverse a String",
        description: "Write a function reverseString(str) that returns the reverse of the input string.",
        placeholder: "function reverseString(str) {\n  // Type your code here\n  return str.split('').reverse().join('');\n}",
        test: (code) => {
            try {
                // eslint-disable-next-line no-new-func
                const fn = new Function('str', `${code}\nreturn reverseString(str);`);
                if (fn("hello") === "olleh" && fn("CodeConnect") === "tcennoCedoC") {
                    return { success: true, msg: "All assertions passed! 2/2 tests succeeded. 🎉" };
                }
                return { success: false, msg: "Assertion failed: Expected reverseString('hello') to return 'olleh'." };
            } catch (err) {
                return { success: false, msg: `Runtime Error: ${err.message}` };
            }
        }
    },
    {
        title: "Find Maximum Value",
        description: "Write a function findMax(arr) that returns the largest number in an array.",
        placeholder: "function findMax(arr) {\n  // Type your code here\n  return Math.max(...arr);\n}",
        test: (code) => {
            try {
                // eslint-disable-next-line no-new-func
                const fn = new Function('arr', `${code}\nreturn findMax(arr);`);
                if (fn([1, 5, 3, 9, 2]) === 9 && fn([-10, -5, -20]) === -5) {
                    return { success: true, msg: "All assertions passed! 2/2 tests succeeded. 🎉" };
                }
                return { success: false, msg: "Assertion failed: Expected findMax([1, 5, 3, 9, 2]) to return 9." };
            } catch (err) {
                return { success: false, msg: `Runtime Error: ${err.message}` };
            }
        }
    }
];

const SYSTEM_LOGS = [
    "📡 Socket establishing connection to node-us-east...",
    "🔒 SSL Handshake verified using TLS_AES_256_GCM_SHA384",
    "🚀 Room #459 initialized by developer team",
    "📝 Realtime operational document sync operational",
    "🤖 AI Assistant module loaded in background runtime",
    "⚡ Connection latency optimized: 14ms RTT",
    "📦 System memory usage optimal: 1.4GB / 16GB",
    "🧪 Assertion framework initialized successfully",
    "🔥 Sandbox security baseline: verified secure"
];

const MOCK_PULSE_TEMPLATES = [
    { text: "solved 'Reverse a String' in JS", user: "alex_dev", avatar: "👨‍💻", action: "success" },
    { text: "created a public Python Room #28", user: "sophia_code", avatar: "👩‍💻", action: "create" },
    { text: "earned the 'Streak Master' badge!", user: "kyle_t", avatar: "🔥", action: "badge" },
    { text: "joined Room #122 (Algorithms)", user: "nathan_s", avatar: "👤", action: "join" },
    { text: "optimized sandbox runtime by 15%", user: "mira_v", avatar: "⚡", action: "optimize" },
    { text: "solved 'Find Maximum Value' in Python", user: "lucas_x", avatar: "🐍", action: "success" },
    { text: "triggered test suite pass (4/4)", user: "emma_w", avatar: "🧪", action: "test" },
    { text: "created a collaborative JS Room #419", user: "dev_dan", avatar: "💻", action: "create" }
];

const AI_INSIGHTS = [
    {
        title: "Practice Suggestion",
        text: "You haven't practiced Graph algorithms this week. Try starting a room for Graph Traversals!",
        tag: "Algorithms",
        actionText: "Practice Graphs",
        challengeIndex: 0
    },
    {
        title: "Efficiency Tip",
        text: "Your Debugging competency score is 92%. Try using the daily challenge to practice speed!",
        tag: "Speed Run",
        actionText: "Speed Challenge",
        challengeIndex: 1
    },
    {
        title: "Community Insight",
        text: "Javascript rooms are trending today! 4 active sessions are working on arrays. Join one now.",
        tag: "Collaboration",
        actionText: "Join JS Session",
        actionType: "join-widget"
    }
];

const BADGES = [
    { id: 'b1', title: 'First Room', desc: 'Created your first sandbox', requirement: 'Create 1 room', icon: <FaPlus />, unlocked: true, color: '#a855f7' },
    { id: 'b2', title: 'Polyglot', desc: 'Used multiple languages', requirement: 'Use 2+ languages', icon: <FaLaptopCode />, unlocked: true, color: '#06b6d4' },
    { id: 'b3', title: 'Streak Maker', desc: 'Active for 5 days in a row', requirement: '5-day streak', icon: <FaMeteor />, unlocked: true, color: '#eab308' },
    { id: 'b4', title: 'Bug Smasher', desc: 'Fix compiler errors', requirement: 'Pass 10 assertions', icon: <FaBug />, unlocked: false, color: '#ef4444' },
    { id: 'b5', title: 'Code Partner', desc: 'Solve with a partner', requirement: 'Join a live session', icon: <FaUserAstronaut />, unlocked: false, color: '#10b981' },
    { id: 'b6', title: 'Speed Solver', desc: 'Submit code under 10s', requirement: 'Solve in under 10 seconds', icon: <FaTerminal />, unlocked: false, color: '#ec4899' }
];

const Dashboard = () => {
    const { user, firebaseUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalSessions: 0, roomsCreated: 0, languagesUsed: [] });
    const [myRooms, setMyRooms] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isOnlineUsersModalOpen, setIsOnlineUsersModalOpen] = useState(false);

    // Mouse coordinates for hero spotlight
    const [heroCoords, setHeroCoords] = useState({ x: 0, y: 0 });

    // Interactive custom state variables
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [commandQuery, setCommandQuery] = useState('');
    const [activeLanguageFilter, setActiveLanguageFilter] = useState('all');
    const [consoleLogs, setConsoleLogs] = useState([
        "💻 CodeConnect Terminal System v1.4",
        "⚙️ Core dependencies mapped to virtual sandbox",
        "✅ Active workspace loaded"
    ]);
    const [challengeIndex, setChallengeIndex] = useState(0);
    const [codeSnippet, setCodeSnippet] = useState(CHALLENGES[0].placeholder);
    const [sandboxOutput, setSandboxOutput] = useState('');
    const [sandboxStatus, setSandboxStatus] = useState('idle'); // 'idle' | 'running' | 'success' | 'error'

    // Focus Mode Pomodoro Timer state
    const [timeLeft, setTimeLeft] = useState(1500); // 25 mins
    const [timerRunning, setTimerRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [pomodoroCount, setPomodoroCount] = useState(2);
    const totalTimerTime = isBreak ? 300 : 1500;

    // AI Insight Card state
    const [insightIndex, setInsightIndex] = useState(0);
    const [animatingInsight, setAnimatingInsight] = useState(false);

    // Live Pulse Feed state
    const [pulseEvents, setPulseEvents] = useState([
        { id: 1, text: "solved 'Reverse a String' in JS", user: "alex_dev", avatar: "👨‍💻", time: "Just now", action: "success" },
        { id: 2, text: "created a public Python Room #28", user: "sophia_code", avatar: "👩‍💻", time: "2m ago", action: "create" },
        { id: 3, text: "earned the 'Streak Master' badge!", user: "kyle_t", avatar: "🔥", time: "5m ago", action: "badge" },
        { id: 4, text: "joined Room #122 (Algorithms)", user: "nathan_s", avatar: "👤", time: "8m ago", action: "join" }
    ]);

    // Active tooltip for Heatmap
    const [hoveredCell, setHoveredCell] = useState(null);

    // Custom SVG chart data and tooltip interaction
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const chartData = [
        { day: "Mon", sessions: 4, index: 0 },
        { day: "Tue", sessions: 7, index: 1 },
        { day: "Wed", sessions: 5, index: 2 },
        { day: "Thu", sessions: 12, index: 3 },
        { day: "Fri", sessions: 8, index: 4 },
        { day: "Sat", sessions: 15, index: 5 },
        { day: "Sun", sessions: 9, index: 6 }
    ];

    const chartRef = useRef(null);

    // Activity Heatmap generator (20 weeks x 7 days)
    const heatmapData = useMemo(() => {
        const data = [];
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - 140);
        const startDay = startDate.getDay();
        startDate.setDate(startDate.getDate() - startDay);

        for (let i = 0; i < 140; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const r = Math.random();
            let sessions = 0;
            if (r > 0.88) sessions = 4;
            else if (r > 0.75) sessions = 2;
            else if (r > 0.5) sessions = 1;
            else if (r > 0.95) sessions = 5;

            data.push({
                date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                sessions,
                dayOfWeek: currentDate.getDay(),
                weekIndex: Math.floor(i / 7)
            });
        }
        return data;
    }, []);

    // Radar Chart configuration
    const skillScores = [
        { name: "Algorithms", value: 85 },
        { name: "Data Structures", value: 75 },
        { name: "Debugging", value: 92 },
        { name: "Collaboration", value: 80 },
        { name: "Speed", value: 68 },
        { name: "Consistency", value: 85 }
    ];

    const getRadarCoordinates = (index, value, maxVal = 100, maxRadius = 55) => {
        const angle = (index * 60 - 90) * (Math.PI / 180);
        const radius = (value / maxVal) * maxRadius;
        const x = 75 + radius * Math.cos(angle);
        const y = 70 + radius * Math.sin(angle);
        return { x, y };
    };

    const handleHeroMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHeroCoords({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    // Hotkey listener for Command Palette (Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Simulated log feed scrolling
    useEffect(() => {
        const interval = setInterval(() => {
            const randomLog = SYSTEM_LOGS[Math.floor(Math.random() * SYSTEM_LOGS.length)];
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setConsoleLogs(prev => [...prev, `[${time}] ${randomLog}`].slice(-8));
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Daily pulse feed live update
    useEffect(() => {
        const interval = setInterval(() => {
            const template = MOCK_PULSE_TEMPLATES[Math.floor(Math.random() * MOCK_PULSE_TEMPLATES.length)];
            const newEvent = {
                id: Date.now(),
                text: template.text,
                user: template.user,
                avatar: template.avatar,
                time: "Just now",
                action: template.action
            };
            setPulseEvents(prev => [newEvent, ...prev].slice(0, 5));
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    // Pomodoro Timer Effect
    useEffect(() => {
        let interval = null;
        if (timerRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (!isBreak) {
                setIsBreak(true);
                setTimeLeft(300); // 5 mins break
                setPomodoroCount(prev => prev + 1);
            } else {
                setIsBreak(false);
                setTimeLeft(1500); // 25 mins focus
            }
            setTimerRunning(false);
        }
        return () => clearInterval(interval);
    }, [timerRunning, timeLeft, isBreak]);

    // AI Insight Card auto rotator
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatingInsight(true);
            setTimeout(() => {
                setInsightIndex(prev => (prev + 1) % AI_INSIGHTS.length);
                setAnimatingInsight(false);
            }, 300);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setCodeSnippet(CHALLENGES[challengeIndex].placeholder);
        setSandboxOutput('');
        setSandboxStatus('idle');
    }, [challengeIndex]);

    // Data Load
    useEffect(() => {
        if (authLoading) return;

        const currentUser = user || firebaseUser;
        if (!currentUser) {
            setLoading(false);
            return;
        }

        const loadDashboardData = async () => {
            try {
                const userId = currentUser.uid || currentUser.id;
                const [userStats, rooms, lb] = await Promise.all([
                    getDashboardStats(),
                    fetchUserRooms(userId),
                    getLeaderboard()
                ]);

                if (userStats) setStats(userStats);
                if (rooms) setMyRooms(rooms);
                if (lb) setLeaderboard(lb);

            } catch (err) {
                console.warn("⚠️ Dashboard: Data load failure:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user, firebaseUser, authLoading]);

    const handleCreateRoom = async (options = {}) => {
        setIsCreating(true);
        try {
            const roomData = {
                ...options,
                ownerId: user?.id,
                ownerName: options.guestName || user?.username || "Anonymous"
            };
            const newRoom = await createRoom(roomData);
            if (newRoom.roomId) {
                navigate(`/room/${newRoom.roomId}`);
            }
        } catch (err) {
            console.error('Failed to create room:', err);
            alert('Failed to create room: ' + (err.error || err.message));
            setIsCreating(false);
        }
    };

    const handleJoinRoom = (roomId) => {
        navigate(`/room/${roomId}`);
    };

    // Execute Sandbox Code
    const handleRunSandboxCode = () => {
        setSandboxStatus('running');
        setSandboxOutput('Executing code compile...\nRunning assertion tests...\n');
        setTimeout(() => {
            const result = CHALLENGES[challengeIndex].test(codeSnippet);
            setSandboxOutput(prev => prev + result.msg);
            setSandboxStatus(result.success ? 'success' : 'error');
        }, 1200);
    };

    if (loading) return <LoadingSpinner message="Loading Dashboard..." fullScreen={true} />;
    if (isCreating) return <LoadingSpinner message="Initializing Secure Environment..." fullScreen={true} />;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Command palette filter actions
    const filteredCommands = [
        { name: "Create New Collaborative Room", shortcut: "Enter /create", action: () => { setCommandPaletteOpen(false); setIsModalOpen(true); } },
        { name: "Browse Coding Problems", shortcut: "Go /problems", action: () => navigate("/problems") },
        { name: "Leaderboard Metrics", shortcut: "View /leaderboard", action: () => navigate("/leaderboard") },
        { name: "Run Sandbox Code Suite", shortcut: "Run /sandbox", action: () => { setCommandPaletteOpen(false); handleRunSandboxCode(); } },
        { name: "Toggle Dashboard Theme Accent", shortcut: "Switch /theme", action: () => { alert("Accent spotlight initialized!"); setCommandPaletteOpen(false); } }
    ].filter(cmd => cmd.name.toLowerCase().includes(commandQuery.toLowerCase()));

    // Languages filter logic
    const filteredRooms = myRooms.filter(room => {
        if (activeLanguageFilter === 'all') return true;
        return room.language?.toLowerCase() === activeLanguageFilter.toLowerCase();
    });

    // Custom SVG path calculation for Weekly Analytics
    const svgWidth = 460;
    const svgHeight = 160;
    const paddingX = 40;
    const paddingY = 20;

    const points = chartData.map((d, i) => {
        const x = paddingX + (i * (svgWidth - paddingX * 2)) / (chartData.length - 1);
        const y = svgHeight - paddingY - (d.sessions / 20) * (svgHeight - paddingY * 2);
        return { x, y, day: d.day, sessions: d.sessions };
    });

    const pathD = points.reduce((acc, p, i) => {
        return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

    // Pomodoro helpers
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const pomodoroPercentage = (timeLeft / totalTimerTime) * 100;
    const timerCircumference = 2 * Math.PI * 26; // Radius is 26

    // Streak tracker ring
    const streakTargetCompleted = 4;
    const streakTargetTotal = 5;
    const streakCircumference = 2 * Math.PI * 18; // Radius 18
    const streakPercentage = (streakTargetCompleted / streakTargetTotal) * 100;

    // Radar points string calculation
    const radarPoints = skillScores.map((score, i) => {
        const { x, y } = getRadarCoordinates(i, score.value);
        return `${x},${y}`;
    }).join(' ');

    const handleInsightAction = (insight) => {
        if (insight.actionType === 'join-widget') {
            document.getElementById('quick-join-widget')?.scrollIntoView({ behavior: 'smooth' });
        } else if (insight.challengeIndex !== undefined) {
            setChallengeIndex(insight.challengeIndex);
            document.getElementById('playground-card')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="dashboard-container">
            {/* Ambient Background Mesh */}
            <div className="dashboard-bg-mesh">
                <div className="dash-orb orb-1"></div>
                <div className="dash-orb orb-2"></div>
                <div className="dash-orb orb-3"></div>
            </div>

            {/* Hotkey Hint Bar */}
            <div className="hotkey-tip-banner">
                <span>Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to open Command Center</span>
                <FaKeyboard className="banner-keyboard-icon" />
            </div>

            {/* Bento Grid Container */}
            <div className="bento-grid">
                
                {/* 1. HERO + Greeting + COMMAND HUD (Colspan 2) */}
                <motion.div
                    className="bento-cell hero-cell spotlight-hero"
                    onMouseMove={handleHeroMouseMove}
                    style={{
                        '--hx': `${heroCoords.x}px`,
                        '--hy': `${heroCoords.y}px`
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                >
                    <div className="hero-overlay"></div>
                    <div className="hero-floating-decor">
                        <span className="decor-item item-1">{'{}'}</span>
                        <span className="decor-item item-2">{'</>'}</span>
                        <span className="decor-item item-3">{'() =>'}</span>
                        <span className="decor-item item-4">{'const'}</span>
                    </div>

                    <div className="hero-inner-split">
                        {/* Hero Info */}
                        <div className="hero-left-pane">
                            <div className="gamification-badge-row">
                                <span className="user-title-badge">
                                    <FaUserAstronaut className="badge-icon" /> Level 4 Sandboxed Engineer
                                </span>
                                <div className="xp-bar-wrapper">
                                    <span className="xp-label">XP: 2400 / 3000</span>
                                    <div className="xp-bar-bg">
                                        <motion.div 
                                            className="xp-bar-fill" 
                                            initial={{ width: 0 }}
                                            animate={{ width: "80%" }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                        ></motion.div>
                                    </div>
                                </div>
                            </div>

                            <h1 className="hero-title">
                                {getGreeting()}, <br />
                                <span className="gradient-text">{user?.username || 'Developer'}</span>
                            </h1>
                            <p className="hero-subtitle">
                                Compile code in real-time, complete assertion tests, and invite developers to join live coding rooms.
                            </p>
                            <div className="header-actions">
                                <button onClick={() => setIsModalOpen(true)} className="btn primary-btn action-btn">
                                    <FaPlus /> Custom Session
                                </button>
                                <Link to="/problems" className="btn secondary-btn action-btn">
                                    <FaCode /> Browse Problems
                                </Link>
                            </div>
                        </div>

                        {/* Interactive HUD Pane: Streak Tracker + Focus Timer */}
                        <div className="hero-hud-pane">
                            {/* Streak Tracker HUD */}
                            <div className="hud-card streak-hud">
                                <div className="hud-header">
                                    <span className="hud-tag"><FaFire className="fire-icon-burn" /> Active Streak</span>
                                </div>
                                <div className="hud-body">
                                    <div className="streak-stats-row">
                                        <div className="streak-big-value">
                                            <span>5</span>
                                            <span className="value-label">Days</span>
                                        </div>
                                        <div className="streak-goals">
                                            <div className="goal-item">
                                                <span className="lbl">Record Streak</span>
                                                <span className="val">14 Days</span>
                                            </div>
                                            <div className="goal-item">
                                                <span className="lbl">Weekly Goal</span>
                                                <span className="val">{streakTargetCompleted}/{streakTargetTotal} Days</span>
                                            </div>
                                        </div>
                                        {/* Habit progress ring */}
                                        <div className="streak-progress-ring-wrapper">
                                            <svg width="46" height="46" viewBox="0 0 46 46">
                                                <circle cx="23" cy="23" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                                <circle cx="23" cy="23" r="18" fill="none" stroke="var(--accent-yellow)" strokeWidth="3.5"
                                                    strokeDasharray={streakCircumference}
                                                    strokeDashoffset={streakCircumference - (streakCircumference * streakPercentage) / 100}
                                                    strokeLinecap="round"
                                                    transform="rotate(-90 23 23)"
                                                />
                                            </svg>
                                            <span className="ring-val">{streakPercentage}%</span>
                                        </div>
                                    </div>
                                    <div className="calendar-dots">
                                        {['M','T','W','T','F','S','S'].map((day, idx) => {
                                            const isActive = idx < 4; // Monday to Thursday active
                                            const isToday = idx === 4; // Friday today
                                            return (
                                                <div key={idx} className={`dot-column ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}>
                                                    <span className="dot-label">{day}</span>
                                                    <span className="dot-indicator"></span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Focus Mode / Pomodoro HUD */}
                            <div className="hud-card focus-hud">
                                <div className="hud-header">
                                    <span className="hud-tag"><FaHourglassHalf className="ticking-icon" /> Focus Session</span>
                                    <span className="session-round-indicator">Cycle #{pomodoroCount}</span>
                                </div>
                                <div className="hud-body">
                                    <div className="timer-wrapper">
                                        <div className="timer-ring-container">
                                            <svg width="60" height="60" viewBox="0 0 60 60">
                                                <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
                                                <circle cx="30" cy="30" r="26" fill="none" stroke={isBreak ? "var(--accent-emerald)" : "var(--accent-cyan)"} strokeWidth="4"
                                                    strokeDasharray={timerCircumference}
                                                    strokeDashoffset={timerCircumference - (timerCircumference * pomodoroPercentage) / 100}
                                                    strokeLinecap="round"
                                                    transform="rotate(-90 30 30)"
                                                />
                                            </svg>
                                            <div className="timer-numeric-display">
                                                {formatTime(timeLeft)}
                                            </div>
                                        </div>
                                        <div className="timer-controls">
                                            <button className="timer-btn play-btn" onClick={() => setTimerRunning(!timerRunning)} title={timerRunning ? "Pause" : "Play"}>
                                                {timerRunning ? <FaPause /> : <FaPlay />}
                                            </button>
                                            <button className="timer-btn reset-btn" onClick={() => { setTimerRunning(false); setTimeLeft(totalTimerTime); }} title="Reset">
                                                <FaRedo />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="timer-mode-label">
                                        {isBreak ? "☕ Break Mode Active" : "💻 Deep Coding Focus"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. AI INSIGHT CARD */}
                <motion.div 
                    className="bento-cell ai-insight-cell"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="insight-card-glow"></div>
                    <div className="cell-header">
                        <span className="card-accent-badge"><FaRobot className="glowing-ai-icon" /> AI Dev Coach</span>
                        <span className="insight-tag-lbl">{AI_INSIGHTS[insightIndex].tag}</span>
                    </div>
                    <div className="insight-content-area">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={insightIndex}
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ duration: 0.25 }}
                                className="insight-text-wrapper"
                            >
                                <h4>{AI_INSIGHTS[insightIndex].title}</h4>
                                <p>{AI_INSIGHTS[insightIndex].text}</p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <div className="insight-actions-wrapper">
                        {AI_INSIGHTS[insightIndex].actionText && (
                            <button 
                                className="btn-insight-action"
                                onClick={() => handleInsightAction(AI_INSIGHTS[insightIndex])}
                            >
                                <span>{AI_INSIGHTS[insightIndex].actionText}</span>
                                <FaArrowAltCircleRight className="action-arrow" />
                            </button>
                        )}
                        <div className="insight-carousel-indicators">
                            {AI_INSIGHTS.map((_, idx) => (
                                <span 
                                    key={idx} 
                                    className={`indicator-dot ${idx === insightIndex ? 'active' : ''}`}
                                    onClick={() => setInsightIndex(idx)}
                                ></span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* 3. ACTIVITY HEATMAP */}
                <motion.div 
                    className="bento-cell heatmap-cell"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                >
                    <div className="cell-header">
                        <h3><FaHistory className="header-icon-history" /> Activity Heatmap</h3>
                        <span className="heat-legend">Last 20 Weeks</span>
                    </div>
                    <div className="heatmap-container-box">
                        <svg className="heatmap-svg" viewBox="0 0 270 102">
                            {heatmapData.map((cell, index) => {
                                const size = 9;
                                const gap = 3;
                                const x = cell.weekIndex * (size + gap);
                                const y = cell.dayOfWeek * (size + gap);
                                let colorClass = 'heat-level-0';
                                if (cell.sessions === 1) colorClass = 'heat-level-1';
                                if (cell.sessions === 2) colorClass = 'heat-level-2';
                                if (cell.sessions === 4) colorClass = 'heat-level-3';
                                if (cell.sessions === 5) colorClass = 'heat-level-4';

                                return (
                                    <rect
                                        key={index}
                                        x={x}
                                        y={y}
                                        width={size}
                                        height={size}
                                        rx={1.5}
                                        className={`heatmap-rect ${colorClass}`}
                                        onMouseEnter={(e) => {
                                            const rect = e.target.getBoundingClientRect();
                                            const parentRect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
                                            setHoveredCell({
                                                date: cell.date,
                                                sessions: cell.sessions,
                                                x: rect.left - parentRect.left + 5,
                                                y: rect.top - parentRect.top - 38
                                            });
                                        }}
                                        onMouseLeave={() => setHoveredCell(null)}
                                    />
                                );
                            })}
                        </svg>

                        {/* Floating Heatmap Tooltip */}
                        {hoveredCell && (
                            <div 
                                className="heatmap-tooltip"
                                style={{
                                    left: `${hoveredCell.x}px`,
                                    top: `${hoveredCell.y}px`
                                }}
                            >
                                <div className="tooltip-inner">
                                    <span className="val">{hoveredCell.sessions} sessions</span>
                                    <span className="dt">{hoveredCell.date}</span>
                                </div>
                                <div className="tooltip-arrow"></div>
                            </div>
                        )}
                    </div>
                    <div className="heatmap-footer">
                        <span>Less</span>
                        <div className="legend-blocks">
                            <span className="leg-block heat-level-0"></span>
                            <span className="leg-block heat-level-1"></span>
                            <span className="leg-block heat-level-2"></span>
                            <span className="leg-block heat-level-3"></span>
                            <span className="leg-block heat-level-4"></span>
                        </div>
                        <span>More</span>
                    </div>
                </motion.div>

                {/* 4. SKILL RADAR CHART */}
                <motion.div 
                    className="bento-cell radar-cell"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="cell-header">
                        <h3><FaBrain className="header-icon-accent" /> Competency Radar</h3>
                    </div>
                    <div className="radar-chart-container">
                        <svg className="radar-svg" viewBox="0 0 150 140">
                            {/* Inner concentric hexagons */}
                            {[20, 40, 60, 80, 100].map((radiusVal, rIdx) => {
                                const hexagonPoints = Array.from({ length: 6 }).map((_, i) => {
                                    const { x, y } = getRadarCoordinates(i, radiusVal);
                                    return `${x},${y}`;
                                }).join(' ');

                                return (
                                    <polygon
                                        key={rIdx}
                                        points={hexagonPoints}
                                        fill="none"
                                        stroke="rgba(255,255,255,0.035)"
                                        strokeWidth="0.8"
                                    />
                                );
                            })}

                            {/* Spoke Axes */}
                            {Array.from({ length: 6 }).map((_, i) => {
                                const outerPt = getRadarCoordinates(i, 100);
                                return (
                                    <line
                                        key={i}
                                        x1="75"
                                        y1="70"
                                        x2={outerPt.x}
                                        y2={outerPt.y}
                                        stroke="rgba(255,255,255,0.04)"
                                        strokeWidth="1"
                                    />
                                );
                            })}

                            {/* Skills filled area polygon */}
                            <motion.polygon
                                points={radarPoints}
                                fill="rgba(168, 85, 247, 0.25)"
                                stroke="var(--accent-violet)"
                                strokeWidth="1.8"
                                initial={{ opacity: 0, scale: 0.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                style={{ transformOrigin: '75px 70px' }}
                            />

                            {/* Skill score nodes */}
                            {skillScores.map((score, i) => {
                                const { x, y } = getRadarCoordinates(i, score.value);
                                return (
                                    <circle
                                        key={i}
                                        cx={x}
                                        cy={y}
                                        r="2.5"
                                        fill="#020207"
                                        stroke="var(--accent-cyan)"
                                        strokeWidth="1.5"
                                        className="radar-data-node"
                                    />
                                );
                            })}

                            {/* Axis labels */}
                            {skillScores.map((score, i) => {
                                const labelPt = getRadarCoordinates(i, 118);
                                return (
                                    <text
                                        key={i}
                                        x={labelPt.x}
                                        y={labelPt.y + 3}
                                        textAnchor="middle"
                                        fill="var(--text-secondary)"
                                        fontSize="6.8"
                                        fontWeight="700"
                                        className="radar-label"
                                    >
                                        {score.name}
                                    </text>
                                );
                            })}
                        </svg>
                    </div>
                </motion.div>

                {/* 5. ACHIEVEMENT BADGE SHOWCASE */}
                <motion.div 
                    className="bento-cell badges-cell"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                >
                    <div className="cell-header">
                        <h3><FaTrophy className="header-icon-trophy" /> Achievement Badges</h3>
                        <span className="badges-progress">3 / 6 Unlocked</span>
                    </div>
                    <div className="badge-showcase-grid">
                        {BADGES.map((badge) => (
                            <div 
                                key={badge.id} 
                                className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
                                style={{ '--badge-theme': badge.color }}
                            >
                                <div className="badge-icon-box">
                                    {badge.unlocked ? badge.icon : <FaLock />}
                                </div>
                                <div className="badge-details-hover">
                                    <h5>{badge.title}</h5>
                                    <p className="b-desc">{badge.desc}</p>
                                    <span className="b-req">Req: {badge.requirement}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="badge-progress-bar-container">
                        <div className="progress-bar-bg">
                            <span className="progress-bar-fill" style={{ width: '50%' }}></span>
                        </div>
                    </div>
                </motion.div>

                {/* 6. PLAYGROUND CODE WORKSPACE (Colspan 2) */}
                <motion.div 
                    id="playground-card"
                    className="bento-cell playground-cell"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="playground-header">
                        <div className="challenge-selector-wrapper">
                            <span className="card-accent-badge"><FaRobot /> Daily Challenge</span>
                            <select 
                                value={challengeIndex} 
                                onChange={(e) => setChallengeIndex(Number(e.target.value))}
                                className="challenge-select-dropdown"
                            >
                                {CHALLENGES.map((ch, idx) => (
                                    <option key={idx} value={idx}>{ch.title}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleRunSandboxCode} className="btn-run-tests" disabled={sandboxStatus === 'running'}>
                            {sandboxStatus === 'running' ? <FaSyncAlt className="spinning-icon" /> : <FaPlay />} Execute Tests
                        </button>
                    </div>

                    <div className="playground-body-grid">
                        <div className="challenge-desc-column">
                            <h4>{CHALLENGES[challengeIndex].title}</h4>
                            <p>{CHALLENGES[challengeIndex].description}</p>

                            <div className={`playground-console-status status-${sandboxStatus}`}>
                                <span className="status-indicator-dot"></span>
                                <span className="status-label">Sandbox Status: {sandboxStatus.toUpperCase()}</span>
                            </div>
                        </div>

                        <div className="playground-editor-column">
                            <textarea
                                value={codeSnippet}
                                onChange={(e) => setCodeSnippet(e.target.value)}
                                className="playground-textarea-editor"
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {sandboxOutput && (
                        <div className="playground-output-terminal">
                            <div className="terminal-bar">
                                <span>Console Output</span>
                            </div>
                            <pre className="terminal-code-view">
                                <code>{sandboxOutput}</code>
                            </pre>
                        </div>
                    )}
                </motion.div>

                {/* 7. LIVE PULSE FEED */}
                <motion.div 
                    className="bento-cell pulse-cell"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                >
                    <div className="cell-header">
                        <h3><FaTerminal className="header-icon-magic" /> Live Activity Pulse</h3>
                        <span className="live-pill"><span className="pulse-dot"></span> LIVE</span>
                    </div>
                    <div className="pulse-list-container">
                        <div className="pulse-gradient-overlay top"></div>
                        <div className="pulse-events-list">
                            <AnimatePresence initial={false}>
                                {pulseEvents.map((evt) => (
                                    <motion.div 
                                        key={evt.id} 
                                        className="pulse-event-item"
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="evt-avatar-bubble">
                                            {evt.avatar}
                                        </div>
                                        <div className="evt-details">
                                            <span className="evt-user">@{evt.user}</span>
                                            <span className="evt-text">{evt.text}</span>
                                        </div>
                                        <span className="evt-time">{evt.time}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        <div className="pulse-gradient-overlay bottom"></div>
                    </div>
                </motion.div>

                {/* 8. RECENT SESSIONS & ROOMS FILTER (Colspan 2) */}
                <motion.div 
                    className="bento-cell recent-rooms-cell"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <div className="recent-rooms-header">
                        <h3 className="section-title"><FaHistory className="header-icon-history" /> Workspace Rooms</h3>
                        
                        {/* Language filter pill controls */}
                        <div className="language-capsule-filter">
                            <button 
                                className={`capsule-btn ${activeLanguageFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveLanguageFilter('all')}
                            >
                                All
                            </button>
                            <button 
                                className={`capsule-btn ${activeLanguageFilter === 'python' ? 'active' : ''}`}
                                onClick={() => setActiveLanguageFilter('python')}
                            >
                                Python
                            </button>
                            <button 
                                className={`capsule-btn ${activeLanguageFilter === 'javascript' ? 'active' : ''}`}
                                onClick={() => setActiveLanguageFilter('javascript')}
                            >
                                JS
                            </button>
                            <div className={`capsule-slider active-${activeLanguageFilter}`}></div>
                        </div>
                    </div>

                    <div className="rooms-list-container">
                        {filteredRooms.length === 0 ? (
                            <div className="empty-state">
                                <FaHistory size={26} className="empty-state-icon" />
                                <p>No rooms found matching current language filter.</p>
                            </div>
                        ) : (
                            <div className="rooms-cards-grid">
                                {filteredRooms.map((room, index) => (
                                    <div key={room.id || index} className="room-card">
                                        <div className="room-card-glow"></div>
                                        <div className="room-info">
                                            <div className="lang-badge">
                                                {room.language === 'python' ? '🐍' : '📜'}
                                            </div>
                                            <div className="room-details">
                                                <h4>
                                                    Room #{room.room_id}
                                                    {!room.is_public && <span className="private-badge">PRIVATE</span>}
                                                </h4>
                                                <div className="room-meta">
                                                    <span>{new Date(room.created_at).toLocaleDateString()}</span>
                                                    <span className="dot-divider">•</span>
                                                    <span className="lang-text">{room.language}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleJoinRoom(room.room_id || room.id)} className="rejoin-btn">
                                            Join Room
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* 9. QUICK JOIN LIVE WIDGET */}
                <motion.div 
                    id="quick-join-widget"
                    className="bento-cell join-widget-cell"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                >
                    <div className="cell-header">
                        <h3><FaCompass className="spinning-compass" /> Public Sessions</h3>
                        <span className="public-rooms-count">2 active</span>
                    </div>
                    <div className="join-widget-list">
                        <div className="live-room-widget-item">
                            <div className="live-room-top">
                                <span className="lang-lbl py">Python</span>
                                <span className="live-badge"><span className="pulse-dot"></span> 3/5 online</span>
                            </div>
                            <h5 className="live-room-title">Room #28: Array Traversals</h5>
                            <p className="live-room-desc">Solving LeetCode medium questions together.</p>
                            <button onClick={() => handleJoinRoom('28')} className="btn-join-widget">
                                Quick Join
                            </button>
                        </div>
                        <div className="live-room-widget-item">
                            <div className="live-room-top">
                                <span className="lang-lbl js">JS</span>
                                <span className="live-badge"><span className="pulse-dot"></span> 2/5 online</span>
                            </div>
                            <h5 className="live-room-title">Room #42: Async Code Sandbox</h5>
                            <p className="live-room-desc">Debugging async callbacks in real-time.</p>
                            <button onClick={() => handleJoinRoom('42')} className="btn-join-widget">
                                Quick Join
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* 10. SESSION ANALYTICS CHART (Colspan 2) */}
                <motion.div 
                    className="bento-cell analytics-cell"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <div className="chart-header">
                        <div className="title-section">
                            <span className="indicator-dot"></span>
                            <h3>Coding Session Analytics</h3>
                        </div>
                        <span className="timeframe-label">Last 7 Days</span>
                    </div>

                    <div className="svg-chart-container" ref={chartRef}>
                        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
                            <defs>
                                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0.25)" />
                                    <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                                </linearGradient>
                            </defs>
                            
                            {/* Grid Lines */}
                            <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                            <line x1={paddingX} y1={svgHeight/2} x2={svgWidth - paddingX} y2={svgHeight/2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                            <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                            {/* Filled Gradient Area */}
                            <path d={areaD} fill="url(#chartGlow)" />

                            {/* Line Spline */}
                            <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="3.5" strokeLinecap="round" />
                            
                            {/* Line Gradient */}
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="50%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>

                            {/* Data Nodes */}
                            {points.map((p, i) => (
                                <g key={i}>
                                    <circle 
                                        cx={p.x} 
                                        cy={p.y} 
                                        r="4.5" 
                                        fill="#020207" 
                                        stroke={hoveredPoint?.index === i ? "#ffffff" : "#a855f7"} 
                                        strokeWidth="2.5" 
                                        className="chart-data-node"
                                    />
                                    <circle 
                                        cx={p.x} 
                                        cy={p.y} 
                                        r="16" 
                                        fill="transparent" 
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={() => setHoveredPoint({ ...p, index: i })}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                </g>
                            ))}

                            {/* Day Labels */}
                            {points.map((p, i) => (
                                <text 
                                    key={i} 
                                    x={p.x} 
                                    y={svgHeight - 4} 
                                    textAnchor="middle" 
                                    fill="#64748b" 
                                    fontSize="9" 
                                    fontWeight="600"
                                >
                                    {p.day}
                                </text>
                            ))}
                        </svg>

                        {/* Floating Tooltip Indicator */}
                        <AnimatePresence>
                            {hoveredPoint && (
                                <motion.div 
                                    className="chart-hover-tooltip"
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    style={{
                                        position: 'absolute',
                                        left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                                        top: `${(hoveredPoint.y / svgHeight) * 100 - 45}%`,
                                        transform: 'translateX(-50%)'
                                    }}
                                >
                                    <span className="tooltip-value">{hoveredPoint.sessions} Sessions</span>
                                    <span className="tooltip-day">{hoveredPoint.day}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* 11. LEADERBOARD PANEL */}
                <motion.div 
                    className="bento-cell leaderboard-cell"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.55 }}
                >
                    <div className="leaderboard-panel-box">
                        <div className="leaderboard-title">
                            <FaTrophy className="header-icon-trophy" /> Top Performers
                        </div>

                        {leaderboard.length === 0 ? (
                            <p className="no-leaderboard-data">No data yet</p>
                        ) : (
                            <div className="leaderboard-list">
                                {leaderboard.slice(0, 5).map((user, index) => (
                                    <div key={user.username || index} className="leaderboard-item">
                                        <div className={`user-rank rank-${index + 1 > 3 ? 'other' : index + 1}`}>
                                            {index + 1}
                                        </div>
                                        <div className="user-info">
                                            <img src={user.avatar} alt={user.username} className="user-avatar" />
                                            <span className="user-name">{user.username}</span>
                                        </div>
                                        <span className="user-points">{user.points} pts</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link to="/leaderboard" className="view-all-link">
                            View Full Leaderboard <FaArrowRight size={11} className="view-all-arrow" />
                        </Link>
                    </div>
                </motion.div>

            </div>

            {/* Stats Summary Panel Row under Bento */}
            <div className="stats-deck-row">
                <div className="stat-deck-card" onClick={() => setIsOnlineUsersModalOpen(true)}>
                    <div className="ico-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <FaBrain />
                    </div>
                    <div className="deck-info">
                        <span className="val">{onlineUsers.length}</span>
                        <span className="lbl">Online Developers</span>
                    </div>
                </div>
                <div className="stat-deck-card">
                    <div className="ico-box" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                        <FaLaptopCode />
                    </div>
                    <div className="deck-info">
                        <span className="val">{stats.totalSessions}</span>
                        <span className="lbl">Total Code Sessions</span>
                    </div>
                </div>
                <div className="stat-deck-card">
                    <div className="ico-box" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                        <FaProjectDiagram />
                    </div>
                    <div className="deck-info">
                        <span className="val">{stats.roomsCreated}</span>
                        <span className="lbl">Rooms Managed</span>
                    </div>
                </div>
                <div className="stat-deck-card">
                    <div className="ico-box" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                        <FaChartPie />
                    </div>
                    <div className="deck-info">
                        <span className="val">{stats.languagesUsed?.length || 0}</span>
                        <span className="lbl">Languages Compiled</span>
                    </div>
                </div>
            </div>

            {/* REAL-TIME SYSTEM LOGS BOTTOM FOOTER BAR */}
            <div className="system-status-log-footer">
                <div className="log-footer-header">
                    <span className="terminal-status-light"></span>
                    <span className="title">System Engine Output Console</span>
                </div>
                <div className="log-footer-body">
                    {consoleLogs.slice(-3).map((log, idx) => (
                        <div key={idx} className="terminal-log-line">
                            <span className="line-pointer">&gt;</span> {log}
                        </div>
                    ))}
                </div>
            </div>

            {/* COMMAND PALETTE INTERACTIVE MODAL */}
            <AnimatePresence>
                {commandPaletteOpen && (
                    <div className="command-palette-overlay" onClick={() => setCommandPaletteOpen(false)}>
                        <motion.div 
                            className="command-palette-modal"
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="palette-search-row">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    value={commandQuery}
                                    onChange={(e) => setCommandQuery(e.target.value)}
                                    placeholder="Type a workspace command or keyword..."
                                    autoFocus
                                />
                                <button className="palette-close-btn" onClick={() => setCommandPaletteOpen(false)}>
                                    <FaWindowClose />
                                </button>
                            </div>

                            <div className="palette-results-wrapper">
                                <div className="results-header">SUGGESTED SANDBOX COMMANDS</div>
                                {filteredCommands.length === 0 ? (
                                    <div className="no-results">No matching workspace actions found</div>
                                ) : (
                                    filteredCommands.map((cmd, idx) => (
                                        <div 
                                            key={idx} 
                                            className="palette-result-item"
                                            onClick={cmd.action}
                                        >
                                            <span className="action-title">{cmd.name}</span>
                                            <kbd className="action-kbd">{cmd.shortcut}</kbd>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="palette-footer-row">
                                <span>Press <kbd>ESC</kbd> to close</span>
                                <span>Navigate with mouse click / tap</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <RoomChoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateRoom}
                onJoin={handleJoinRoom}
                user={user}
            />

            <OnlineUsersModal
                isOpen={isOnlineUsersModalOpen}
                onClose={() => setIsOnlineUsersModalOpen(false)}
                users={onlineUsers}
            />
        </div>
    );
};

export default Dashboard;
