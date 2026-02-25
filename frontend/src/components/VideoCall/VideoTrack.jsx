// src/components/VideoCall/VideoTrack.jsx
import React, { useEffect, useRef, useState } from 'react';
import { MdMicOff, MdVideocamOff, MdSignalCellularAlt } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const VideoTrack = ({
    stream,
    userName,
    isLocal = false,
    audioEnabled = true,
    videoEnabled = true,
    isSpeaking = false // This would ideally be driven by an audio analyzer
}) => {
    const videoRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`vc-track-card ${isSpeaking ? 'speaking' : ''}`}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                onLoadedMetadata={() => setIsLoaded(true)}
                className="vc-video-element"
                style={{ opacity: !videoEnabled || !isLoaded ? 0 : 1 }}
            />

            {/* Organic Speaking Pulsing Ring */}
            <AnimatePresence>
                {isSpeaking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.02, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            style={{ position: 'absolute', inset: 0, border: '3px solid rgba(59, 130, 246, 0.5)', borderRadius: '24px' }}
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                opacity: [0.1, 0.3, 0.1]
                            }}
                            transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}
                            style={{ position: 'absolute', inset: '-4px', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '20px' }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Avatar Placeholder (when video is off) */}
            <AnimatePresence>
                {(!videoEnabled || !isLoaded) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="vc-avatar-container"
                    >
                        <motion.div
                            animate={{
                                scale: isSpeaking ? [1, 1.1, 1] : 1,
                                boxShadow: isSpeaking ? ["0 0 0px rgba(59,130,246,0)", "0 0 30px rgba(59,130,246,0.5)", "0 0 0px rgba(59,130,246,0)"] : "0 8px 32px rgba(0,0,0,0.3)"
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="vc-avatar-circle"
                        >
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                                alt={userName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                className={isSpeaking ? 'scale-110' : ''}
                            />
                            {!videoEnabled && (
                                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <MdVideocamOff className="text-white/60 text-2xl" />
                                </div>
                            )}
                        </motion.div>
                        <motion.span
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-xs-caps"
                            style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.4)' }}
                        >
                            {isSpeaking ? 'Speaking...' : 'Camera Off'}
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Glassmorphism Info Overlay */}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="glass-badge" style={{ padding: '6px 12px' }}>
                    {/* Active Status Dot */}
                    <div className={`status-dot ${audioEnabled ? 'green' : 'red'}`} style={{ width: '8px', height: '8px' }}>
                        <span className="ping"></span>
                        <span className="core" style={{ width: '8px', height: '8px' }}></span>
                    </div>

                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {userName} {isLocal && '(You)'}
                    </span>

                    <div style={{ width: '1px', height: '12px', background: 'rgba(255, 255, 255, 0.2)' }}></div>

                    {isSpeaking ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '12px' }}>
                            {[1, 2, 3].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [4, 10, 4] }}
                                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                    style={{ width: '2px', backgroundColor: '#60a5fa', borderRadius: '1px' }}
                                />
                            ))}
                        </div>
                    ) : (
                        <MdSignalCellularAlt className="text-white/60" style={{ fontSize: '10px' }} />
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <AnimatePresence>
                        {!audioEnabled && (
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0 }}
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)', backdropFilter: 'blur(12px)', padding: '8px', borderRadius: '50%', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                            >
                                <MdMicOff style={{ color: '#ffffff', fontSize: '12px' }} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default VideoTrack;
