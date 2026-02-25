// src/components/VideoCall/VideoTrack.jsx
import React, { useEffect, useRef } from 'react';
import { MdMicOff, MdVideocamOff } from 'react-icons/md';

const VideoTrack = ({
    stream,
    userName,
    isLocal = false,
    audioEnabled = true,
    videoEnabled = true
}) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative w-full h-full bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-lg">
            {/* Video */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className={`w-full h-full object-cover ${!videoEnabled ? 'hidden' : ''}`}
            />

            {/* Placeholder when video disabled */}
            {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600 shadow-inner">
                        <span className="text-white text-2xl font-bold">
                            {userName ? userName[0].toUpperCase() : '?'}
                        </span>
                    </div>
                </div>
            )}

            {/* User Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium drop-shadow-md">{userName}</span>
                        {isLocal && <span className="bg-blue-500/80 px-2 py-0.5 rounded text-[10px] text-white font-bold uppercase tracking-wider">You</span>}
                    </div>

                    {/* Status Indicators */}
                    <div className="flex gap-1.5">
                        {!audioEnabled && (
                            <div className="bg-red-500/90 p-1.5 rounded-full shadow-sm">
                                <MdMicOff className="text-white text-xs" />
                            </div>
                        )}
                        {!videoEnabled && (
                            <div className="bg-red-500/90 p-1.5 rounded-full shadow-sm">
                                <MdVideocamOff className="text-white text-xs" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoTrack;
