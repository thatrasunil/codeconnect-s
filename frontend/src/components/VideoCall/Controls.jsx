// src/components/VideoCall/Controls.jsx
import React from 'react';
import {
    MdMic,
    MdMicOff,
    MdVideocam,
    MdVideocamOff,
    MdCallEnd,
    MdScreenShare,
    MdStopScreenShare,
    MdSettings,
    MdPresentToAll
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const Controls = ({
    localVideoEnabled,
    localAudioEnabled,
    onToggleVideo,
    onToggleAudio,
    onEndCall,
    onScreenShare,
    screenShareActive = false,
    loading = false
}) => {
    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
        >
            {/* Audio Toggle */}
            <ControlButton
                onClick={onToggleAudio}
                active={localAudioEnabled}
                icon={localAudioEnabled ? <MdMic size={20} /> : <MdMicOff size={20} />}
                className={!localAudioEnabled ? 'danger' : ''}
                label={localAudioEnabled ? 'Mute' : 'Unmute'}
                disabled={loading}
            />

            {/* Video Toggle */}
            <ControlButton
                onClick={onToggleVideo}
                active={localVideoEnabled}
                icon={localVideoEnabled ? <MdVideocam size={20} /> : <MdVideocamOff size={20} />}
                className={!localVideoEnabled ? 'danger' : ''}
                label={localVideoEnabled ? 'Stop Video' : 'Start Video'}
                disabled={loading}
            />

            <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 4px' }}></div>

            {/* Screen Share */}
            <ControlButton
                onClick={onScreenShare}
                active={screenShareActive}
                icon={screenShareActive ? <MdPresentToAll size={20} /> : <MdScreenShare size={20} />}
                label="Present"
                disabled={loading}
            />

            {/* Settings Mock */}
            <ControlButton
                onClick={() => { }}
                active={false}
                icon={<MdSettings size={20} />}
                label="Settings"
                disabled={loading}
            />

            <div style={{ width: '8px' }}></div>

            {/* End Call Button - Distinctive */}
            <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEndCall}
                disabled={loading}
                className="vc-btn danger"
                title="End Call"
            >
                <MdCallEnd size={24} />
            </motion.button>
        </motion.div>
    );
};

const ControlButton = ({ onClick, active, icon, label, disabled, className = '' }) => (
    <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        disabled={disabled}
        className={`vc-btn ${active ? 'active' : ''} ${className}`}
        title={label}
        style={{ position: 'relative' }}
    >
        {icon}
        <span className="vc-tooltip">
            {label}
        </span>
    </motion.button>
);

export default Controls;
