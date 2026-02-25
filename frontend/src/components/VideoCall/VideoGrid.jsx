// src/components/VideoCall/VideoGrid.jsx
import React, { useMemo } from 'react';
import VideoTrack from './VideoTrack';
import { useVideoStore } from '../../store/videoStore';
import { motion, AnimatePresence } from 'framer-motion';

const VideoGrid = () => {
    const {
        localStream,
        remoteStreams,
        participants,
        currentUser,
        localVideoEnabled,
        localAudioEnabled
    } = useVideoStore();

    // Calculate grid layout based on number of participants
    const gridConfig = useMemo(() => {
        const total = participants.length + 1; // +1 for local

        if (total === 1) return { cols: 'cols-1', rows: 'rows-1' };
        if (total === 2) return { cols: 'cols-2', rows: 'rows-1' };
        if (total <= 4) return { cols: 'cols-2', rows: 'rows-2' };
        if (total <= 6) return { cols: 'cols-3', rows: 'rows-2' };
        if (total <= 9) return { cols: 'cols-3', rows: 'rows-3' };
        return { cols: 'cols-4', rows: 'rows-3' };
    }, [participants.length]);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
            {/* Video Grid Container */}
            <div className={`vc-grid ${gridConfig.cols} ${gridConfig.rows}`}>
                <AnimatePresence mode="popLayout">
                    {/* Local Video */}
                    <motion.div
                        key="local-user"
                        layout
                        style={{ width: '100%', height: '100%', minHeight: '150px' }}
                    >
                        <VideoTrack
                            stream={localStream}
                            userName={currentUser?.displayName || currentUser?.username || 'You'}
                            isLocal={true}
                            videoEnabled={localVideoEnabled}
                            audioEnabled={localAudioEnabled}
                        />
                    </motion.div>

                    {/* Remote Videos */}
                    {participants.map((participant) => (
                        <motion.div
                            key={participant.peerId}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            style={{ width: '100%', height: '100%', minHeight: '150px' }}
                        >
                            <VideoTrack
                                stream={remoteStreams.get(participant.peerId)}
                                userName={participant.userName}
                                isLocal={false}
                                videoEnabled={participant.videoEnabled !== false}
                                audioEnabled={participant.audioEnabled !== false}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Premium Indicator Bar */}
            <div className="vc-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', marginLeft: '12px' }}>
                        <div style={{ marginLeft: '-12px', zIndex: 40 }}>
                            <UserAvatar user={currentUser} ring={true} />
                        </div>
                        {participants.slice(0, 3).map((p, idx) => (
                            <div key={p.peerId} style={{ marginLeft: '-12px', zIndex: 30 - idx }}>
                                <UserAvatar user={{ displayName: p.userName }} />
                            </div>
                        ))}
                        {participants.length > 3 && (
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#1e293b',
                                border: '2px solid #0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: '900',
                                color: '#94a3b8',
                                marginLeft: '-12px',
                                zIndex: 5
                            }}>
                                +{participants.length - 3}
                            </div>
                        )}
                    </div>
                    <span className="text-xs-caps" style={{ color: '#60a5fa', opacity: 0.8 }}>
                        {participants.length + 1} Active Now
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="status-dot green" style={{ width: '6px', height: '6px' }}>
                        <span className="ping"></span>
                        <span className="core" style={{ width: '6px', height: '6px' }}></span>
                    </div>
                    <span className="text-xs-caps" style={{ fontSize: '9px', color: '#64748b' }}>End-to-End Encrypted</span>
                </div>
            </div>
        </div>
    );
};

const UserAvatar = ({ user, ring = false }) => (
    <div className={`vc-user-avatar ${ring ? 'vc-avatar-ring' : ''}`}>
        <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'user'}`}
            alt="avatar"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
    </div>
);

export default VideoGrid;
