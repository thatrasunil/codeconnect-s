// src/components/VideoCall/VideoCall.jsx
import React, { useEffect, useState } from 'react';
import VideoGrid from './VideoGrid';
import Controls from './Controls';
import ParticipantList from './ParticipantList';
import { useVideoCall } from '../../hooks/useVideoCall';
import { useVideoStore } from '../../store/videoStore';
import { motion, AnimatePresence } from 'framer-motion';

const VideoCall = ({ socket, roomId, currentUser }) => {
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
    } = useVideoCall(socket, roomId, currentUser);

    const [screenShareActive, setScreenShareActive] = useState(false);
    const [showFullParticipants, setShowFullParticipants] = useState(false);

    // Auto start video call on mount
    useEffect(() => {
        if (!isCallActive) {
            startVideoCall();
        }
        // We don't end on unmount automatically as the user might just be toggling the UI
    }, [isCallActive, startVideoCall]);

    const handleScreenShare = async () => {
        try {
            if (!screenShareActive) {
                // Start screen share logic placeholder (requires track replacement in usePeerConnections)
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: 'always' },
                    audio: false
                });

                // TODO: Implement track replacement in usePeerConnections
                // For now, we toggle state to show UI intent
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

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-6 rounded-xl border border-red-500/30">
                <div className="text-center">
                    <div className="bg-red-500/20 p-4 rounded-full inline-block mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Connection Failed</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6">{error}</p>
                    <button
                        onClick={() => { videoStore.reset(); startVideoCall(); }}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-slate-900 rounded-xl">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-full animate-pulse"></div>
                    </div>
                </div>
                <p className="mt-6 text-slate-400 font-medium animate-pulse tracking-wide uppercase text-[10px]">Initializing Secure Stream...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full bg-slate-950 text-white gap-3 p-3 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden"
        >
            {/* Header Info */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Session: {roomId}</span>
                </div>
                <button
                    onClick={() => setShowFullParticipants(!showFullParticipants)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-md transition-colors"
                >
                    {showFullParticipants ? 'Hide Details' : 'View Participants'}
                </button>
            </div>

            {/* Video Grid - Main Content */}
            <div className="flex-1 min-h-0">
                <VideoGrid />
            </div>

            {/* Optional Expanded Participants */}
            <AnimatePresence>
                {showFullParticipants && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <ParticipantList />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Controls Area */}
            <div className="flex-shrink-0 pt-2 flex justify-center">
                <Controls
                    localVideoEnabled={localVideoEnabled}
                    localAudioEnabled={localAudioEnabled}
                    onToggleVideo={toggleCamera}
                    onToggleAudio={toggleMicrophone}
                    onEndCall={endVideoCall}
                    onScreenShare={handleScreenShare}
                    screenShareActive={screenShareActive}
                    loading={loading}
                />
            </div>
        </motion.div>
    );
};

export default VideoCall;
