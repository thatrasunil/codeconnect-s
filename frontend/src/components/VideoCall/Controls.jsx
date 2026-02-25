// src/components/VideoCall/Controls.jsx
import React from 'react';
import {
    MdMic,
    MdMicOff,
    MdVideocam,
    MdVideocamOff,
    MdCallEnd,
    MdScreenShare,
    MdStopScreenShare
} from 'react-icons/md';

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
        <div className="flex items-center justify-center gap-4 bg-slate-900/90 backdrop-blur-lg p-4 rounded-2xl border border-slate-800 shadow-2xl">
            {/* Toggle Audio */}
            <button
                onClick={onToggleAudio}
                disabled={loading}
                className={`p-3.5 rounded-full transition-all duration-300 transform active:scale-95 shadow-lg ${localAudioEnabled
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-rose-500 hover:bg-rose-600 text-white'
                    }`}
                title={localAudioEnabled ? 'Mute' : 'Unmute'}
            >
                {localAudioEnabled ? (
                    <MdMic size={24} />
                ) : (
                    <MdMicOff size={24} />
                )}
            </button>

            {/* Toggle Video */}
            <button
                onClick={onToggleVideo}
                disabled={loading}
                className={`p-3.5 rounded-full transition-all duration-300 transform active:scale-95 shadow-lg ${localVideoEnabled
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-rose-500 hover:bg-rose-600 text-white'
                    }`}
                title={localVideoEnabled ? 'Stop Video' : 'Start Video'}
            >
                {localVideoEnabled ? (
                    <MdVideocam size={24} />
                ) : (
                    <MdVideocamOff size={24} />
                )}
            </button>

            {/* Screen Share */}
            <button
                onClick={onScreenShare}
                disabled={loading}
                className={`p-3.5 rounded-full transition-all duration-300 transform active:scale-95 shadow-lg ${screenShareActive
                        ? 'bg-sky-500 hover:bg-sky-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                title="Share Screen"
            >
                {screenShareActive ? (
                    <MdStopScreenShare size={24} />
                ) : (
                    <MdScreenShare size={24} />
                )}
            </button>

            {/* End Call Button */}
            <button
                onClick={onEndCall}
                disabled={loading}
                className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300 transform active:scale-95 hover:rotate-12 shadow-red-500/20 shadow-xl"
                title="End Call"
            >
                <MdCallEnd size={24} />
            </button>
        </div>
    );
};

export default Controls;
