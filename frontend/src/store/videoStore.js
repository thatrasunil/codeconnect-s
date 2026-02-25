// src/store/videoStore.js
import { create } from 'zustand';

export const useVideoStore = create((set, get) => ({
    // State
    localStream: null,
    remoteStreams: new Map(), // peerId -> MediaStream
    participants: [], // List of all participants
    localVideoEnabled: true,
    localAudioEnabled: true,
    isCallActive: false,
    roomId: null,
    currentUser: null,
    error: null,

    // Getters
    getRemoteStream: (peerId) => get().remoteStreams.get(peerId),
    getParticipantCount: () => get().participants.length + 1, // +1 for local

    // Setters
    setLocalStream: (stream) => set({ localStream: stream }),

    setRemoteStreams: (peerId, stream) => set((state) => {
        const newStreams = new Map(state.remoteStreams);
        newStreams.set(peerId, stream);
        return { remoteStreams: newStreams };
    }),

    removeRemoteStream: (peerId) => set((state) => {
        const newStreams = new Map(state.remoteStreams);
        newStreams.delete(peerId);
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
