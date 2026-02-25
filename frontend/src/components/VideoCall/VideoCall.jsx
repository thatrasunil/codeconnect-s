// src/components/VideoCall/VideoCall.jsx
import React, { useEffect, useState } from 'react';
import VideoGrid from './VideoGrid';
import Controls from './Controls';
import ParticipantList from './ParticipantList';
import { useVideoCall } from '../../hooks/useVideoCall';
import { motion, AnimatePresence } from 'framer-motion';
import { MdPeople, MdClose, MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import './VideoCall.css';

const VideoCall = ({ roomId, currentUser, onLeave }) => {
    const {
        startVideoCall,
        endVideoCall,
        toggleCamera,
        toggleMicrophone,
        loading,
        isCallActive,
        error,
        localVideoEnabled,
        localAudioEnabled
    } = useVideoCall(null, roomId, currentUser);

    const [screenShareActive, setScreenShareActive] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const hasStartedCall = React.useRef(false);

    // Session Timer
    useEffect(() => {
        if (!isCallActive) {
            setElapsedTime(0);
            return;
        }

        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [isCallActive]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h > 0 ? h : null, m, s].filter(x => x !== null).map(x => x.toString().padStart(2, '0')).join(':');
    };

    // Auto start video call on mount - STRICT ONCE
    useEffect(() => {
        if (!hasStartedCall.current && !isCallActive && !loading) {
            hasStartedCall.current = true;
            startVideoCall();
        }
    }, [startVideoCall, isCallActive, loading]);

    const handleEndCall = async () => {
        try {
            await endVideoCall();
            if (onLeave) onLeave();
        } catch (err) {
            console.error("Error ending call:", err);
            if (onLeave) onLeave(); // Force leave even on error
        }
    };

    const handleScreenShare = async () => {
        try {
            if (!screenShareActive) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: 'always' },
                    audio: false
                });
                setScreenShareActive(true);
                screenStream.getVideoTracks()[0].onended = () => {
                    setScreenShareActive(false);
                };
            } else {
                setScreenShareActive(false);
            }
        } catch (err) {
            console.error('Screen share error:', err);
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="vc-container"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
            >
                <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <MdClose className="text-red-500" style={{ fontSize: '40px' }} />
                </div>
                <h3 className="text-2xl font-black mb-2 tracking-tight">Encryption Failed</h3>
                <p className="text-slate-500 text-sm max-w-xs text-center mb-8 leading-relaxed">{error}</p>
                <button
                    onClick={() => startVideoCall()}
                    className="vc-btn active"
                    style={{ width: 'auto', padding: '0 32px' }}
                >
                    Establish Secure Bridge
                </button>
            </motion.div>
        );
    }

    if (loading) {
        return (
            <div className="vc-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(59, 130, 246, 0.05)', animation: 'pulse-blue 2s infinite' }}></div>
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '64px', height: '64px', border: '4px solid rgba(59, 130, 246, 0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <motion.p
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-xs-caps"
                        style={{ marginTop: '32px', color: '#60a5fa' }}
                    >
                        Negotiating Channels...
                    </motion.p>
                </div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`vc-container ${isFullscreen ? 'fullscreen' : ''}`}
        >
            {/* Main Video Area */}
            <div className="vc-main">
                {/* Dynamic Header */}
                <div className="vc-header">
                    <div className="vc-header-left">
                        <div className="glass-badge">
                            <div className="status-dot red">
                                <span className="ping"></span>
                                <span className="core"></span>
                            </div>
                            <span className="text-xs-caps" style={{ color: '#ef4444' }}>Live</span>
                            <div style={{ width: '1px', height: '12px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
                            <span className="font-mono-bold" style={{ fontSize: '11px' }}>{formatTime(elapsedTime)}</span>
                        </div>

                        <div className="glass-badge">
                            <span className="text-xs-caps" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                Room: <span style={{ color: '#3b82f6' }}>{roomId}</span>
                            </span>
                        </div>
                    </div>

                    <div className="vc-header-right">
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className={`vc-btn ${showSidebar ? 'active' : ''}`}
                        >
                            <MdPeople size={20} />
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="vc-btn"
                        >
                            {isFullscreen ? <MdFullscreenExit size={20} /> : <MdFullscreen size={20} />}
                        </button>
                    </div>
                </div>

                {/* Video Grid Component */}
                <div className="vc-grid-container">
                    <VideoGrid />
                </div>

                {/* Floating Docked Controls */}
                <div className="vc-controls-dock">
                    <div className="glass-panel vc-controls">
                        <Controls
                            localVideoEnabled={localVideoEnabled}
                            localAudioEnabled={localAudioEnabled}
                            onToggleVideo={toggleCamera}
                            onToggleAudio={toggleMicrophone}
                            onEndCall={handleEndCall}
                            onScreenShare={handleScreenShare}
                            screenShareActive={screenShareActive}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>

            {/* Collapsible Sidebar for Participants */}
            <AnimatePresence>
                {showSidebar && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 340, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="vc-sidebar"
                    >
                        <div style={{ width: '340px', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                            <ParticipantList />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default VideoCall;
