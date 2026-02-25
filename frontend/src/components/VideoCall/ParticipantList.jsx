// src/components/VideoCall/ParticipantList.jsx
import React from 'react';
import { useVideoStore } from '../../store/videoStore';
import { MdCheckCircle, MdMicOff, MdVideocamOff, MdMoreVert } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const ParticipantList = () => {
    const { participants, currentUser } = useVideoStore();

    return (
        <div className="vc-sidebar-content custom-scrollbar" style={{ overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h4 className="text-xs-caps" style={{ color: '#3b82f6' }}>Collaborators</h4>
                    <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>{participants.length + 1} users connected</p>
                </div>
                <div style={{ padding: '8px', cursor: 'pointer', borderRadius: '8px' }}>
                    <MdMoreVert style={{ color: '#94a3b8' }} />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Current User */}
                <ParticipantItem
                    user={currentUser}
                    isLocal={true}
                    isActive={true}
                    displayName={currentUser?.displayName || currentUser?.username || 'You'}
                    role="Host"
                    joinedAt="Active Now"
                />

                {/* Remote Participants */}
                <AnimatePresence mode="popLayout">
                    {participants.map(participant => (
                        <ParticipantItem
                            key={participant.peerId}
                            user={{ photoURL: participant.userAvatar, displayName: participant.userName }}
                            isLocal={false}
                            isActive={true}
                            displayName={participant.userName}
                            role="Contributor"
                            joinedAt={new Date(participant.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            videoEnabled={participant.videoEnabled}
                            audioEnabled={participant.audioEnabled}
                        />
                    ))}
                </AnimatePresence>

                {participants.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '24px', backgroundColor: 'rgba(255,255,255,0.02)' }}
                    >
                        <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                            <div className="status-dot green" style={{ width: '8px', height: '8px' }}>
                                <span className="ping"></span>
                                <span className="core" style={{ width: '8px', height: '8px' }}></span>
                            </div>
                        </div>
                        <p className="text-xs-caps" style={{ color: '#64748b' }}>Awaiting Peers...</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const ParticipantItem = React.forwardRef(({ user, isLocal, isActive, displayName, role, joinedAt, videoEnabled = true, audioEnabled = true }, ref) => (
    <motion.div
        ref={ref}
        layout
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 20, opacity: 0 }}
        className="vc-participant-item"
    >
        <div style={{ position: 'relative' }}>
            <img
                src={user?.photoURL || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
                alt={displayName}
                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 10 }}
            />
            {isActive && (
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '50%', border: '2px solid #020617', zIndex: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}></div>
            )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontBold: 'bold', color: '#ffffff' }}>{displayName}</span>
                {isLocal && (
                    <span className="vc-badge-me">Me</span>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px' }}>
                <span style={{ color: '#64748b' }}>{role}</span>
                <div style={{ width: '4px', height: '4px', backgroundColor: '#334155', borderRadius: '50%' }}></div>
                <span style={{ color: '#475569' }}>{joinedAt}</span>
            </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!audioEnabled && <MdMicOff style={{ color: 'rgba(239, 68, 68, 0.6)' }} size={14} />}
            {!videoEnabled && <MdVideocamOff style={{ color: '#475569' }} size={14} />}
            <MdCheckCircle style={{ color: isLocal ? '#3b82f6' : 'rgba(34, 197, 94, 0.4)' }} size={16} />
        </div>
    </motion.div>
));

export default ParticipantList;
