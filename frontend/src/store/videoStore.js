// src/store/videoStore.js
import { create } from 'zustand';

export const useVideoStore = create((set, get) => ({
    // State
    localStream: null,
    remoteStreams: new Map(), // socketId -> MediaStream
    participants: [], // List of all participants
    localVideoEnabled: true,
    localAudioEnabled: true,
    isCallActive: false,
    roomId: null,
    currentUser: null,
    error: null,

    // Getters
    getRemoteStream: (socketId) => get().remoteStreams.get(socketId),
    getParticipantCount: () => get().participants.length + 1, // +1 for local

    // Setters
    setLocalStream: (stream) => set({ localStream: stream }),

    setRemoteStreams: (socketId, stream) => set((state) => {
        const newStreams = new Map(state.remoteStreams);
        newStreams.set(socketId, stream);
        return { remoteStreams: newStreams };
    }),

    removeRemoteStream: (socketId) => set((state) => {
        const newStreams = new Map(state.remoteStreams);
        newStreams.delete(socketId);
        return { remoteStreams: newStreams };
    }),

    setParticipants: (participants) => set({ participants }),

    toggleLocalVideo: () => set((state) => ({
        localVideoEnabled: !state.localVideoEnabled
    })),

    toggleLocalAudio: () => set((state) => ({
        localAudioEnabled: !state.localAudioEnabled
    })),

    setCallActive: (isActive) => set({ isCallActive: isActive }),

    setRoomInfo: (roomId, currentUser) => set({ roomId, currentUser }),

    setError: (error) => set({ error }),

    // Clear all
    reset: () => set({
        localStream: null,
        remoteStreams: new Map(),
        participants: [],
        localVideoEnabled: true,
        localAudioEnabled: true,
        isCallActive: false,
        roomId: null,
        currentUser: null,
        error: null
    })
}));
