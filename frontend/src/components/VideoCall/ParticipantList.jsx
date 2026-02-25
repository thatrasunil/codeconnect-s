// src/components/VideoCall/ParticipantList.jsx
import React from 'react';
import { useVideoStore } from '../../store/videoStore';
import { MdCheckCircle } from 'react-icons/md';

const ParticipantList = () => {
    const { participants, currentUser } = useVideoStore();

    return (
        <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border border-slate-800 shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-400">Participants ({participants.length + 1})</h4>
                <div className="flex -space-x-2">
                    {/* Simple avatar stacks could go here */}
                </div>
            </div>

            <div className="space-y-2">
                {/* Current User */}
                <div className="flex items-center gap-3 p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50 transition-colors hover:bg-slate-800">
                    <div className="relative">
                        <img
                            src={currentUser?.photoURL || currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.displayName || 'user'}`}
                            alt="me"
                            className="w-8 h-8 rounded-full border border-slate-600"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{currentUser?.displayName || currentUser?.username || 'You'}</span>
                        <span className="text-[10px] text-blue-400 font-medium uppercase tracking-tighter">Host</span>
                    </div>
                    <MdCheckCircle className="ml-auto text-green-500" size={16} />
                </div>

                {/* Remote Participants */}
                {participants.map(participant => (
                    <div
                        key={participant.peerId}
                        className="flex items-center gap-3 p-2.5 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all"
                    >
                        <div className="relative">
                            <img
                                src={participant.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.userName}`}
                                alt={participant.userName}
                                className="w-8 h-8 rounded-full grayscale-[0.3]"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-200">{participant.userName}</span>
                            <span className="text-[10px] text-slate-500">
                                Joined {new Date(participant.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <MdCheckCircle className="ml-auto text-slate-500/50" size={16} />
                    </div>
                ))}

                {participants.length === 0 && (
                    <div className="text-center py-4 bg-slate-800/20 rounded-lg border border-dashed border-slate-700/50">
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Waiting for others to join...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParticipantList;
