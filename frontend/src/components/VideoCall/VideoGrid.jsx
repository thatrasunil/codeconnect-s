// src/components/VideoCall/VideoGrid.jsx
import React, { useMemo } from 'react';
import VideoTrack from './VideoTrack';
import { useVideoStore } from '../../store/videoStore';

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
    const gridClass = useMemo(() => {
        const total = participants.length + 1; // +1 for local

        if (total === 1) return 'grid-cols-1';
        if (total === 2) return 'grid-cols-2';
        if (total <= 4) return 'grid-cols-2 grid-rows-2';
        if (total <= 6) return 'grid-cols-3 grid-rows-2';
        return 'grid-cols-3 grid-rows-3';
    }, [participants.length]);

    return (
        <div className="w-full h-full flex flex-col bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Video Grid */}
            <div className={`flex-1 grid ${gridClass} gap-3 p-3 overflow-auto custom-scrollbar`}>
                {/* Local Video */}
                <VideoTrack
                    stream={localStream}
                    userName={currentUser?.displayName || currentUser?.username || 'You'}
                    isLocal={true}
                    videoEnabled={localVideoEnabled}
                    audioEnabled={localAudioEnabled}
                />

                {/* Remote Videos */}
                {participants.map((participant) => (
                    <VideoTrack
                        key={participant.socketId}
                        stream={remoteStreams.get(participant.socketId)}
                        userName={participant.userName}
                        isLocal={false}
                        videoEnabled={participant.videoEnabled !== false}
                        audioEnabled={participant.audioEnabled !== false}
                    />
                ))}
            </div>

            {/* Participant Banner */}
            <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 text-white text-[11px] border-t border-slate-800/50 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                <span className="font-bold text-blue-400 uppercase tracking-tighter mr-2">{participants.length + 1} Active</span>
                {participants.map(p => (
                    <span key={p.socketId} className="bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                        {p.userName}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default VideoGrid;
