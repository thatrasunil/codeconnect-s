// src/hooks/useVideoCall.js
import { useEffect, useState } from 'react';
import { useVideoStore } from '../store/videoStore';
import { useLocalStream } from './useLocalStream';
import { usePeerConnections } from './usePeerConnections';

export const useVideoCall = (socket, roomId, currentUser) => {
    const videoStore = useVideoStore();
    const { getLocalStream, stopLocalStream, localStream } = useLocalStream();
    const {
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        removePeerConnection,
        closeAllConnections
    } = usePeerConnections(socket, localStream);

    const [loading, setLoading] = useState(false);

    // Start video call
    const startVideoCall = async () => {
        try {
            setLoading(true);

            // Get local stream
            const stream = await getLocalStream();
            if (!stream) {
                throw new Error('Failed to get local stream');
            }

            // Set room info
            videoStore.setRoomInfo(roomId, currentUser);
            videoStore.setCallActive(true);

            // Join video room on socket
            if (socket) {
                socket.emit('video:join-room', {
                    roomId,
                    userId: currentUser.uid || currentUser.id,
                    userName: currentUser.displayName || currentUser.username || currentUser.name,
                    userAvatar: currentUser.photoURL || currentUser.avatar
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error starting video call:', error);
            videoStore.setError(error.message);
            setLoading(false);
        }
    };

    // End video call
    const endVideoCall = async () => {
        try {
            // Leave video room
            if (socket) {
                socket.emit('video:leave-room', {
                    roomId
                });
            }

            // Close all connections
            closeAllConnections();

            // Stop local stream
            stopLocalStream();

            // Reset store
            videoStore.reset();
        } catch (error) {
            console.error('Error ending video call:', error);
        }
    };

    // Toggle camera
    const toggleCamera = () => {
        videoStore.toggleLocalVideo();
        if (socket) {
            socket.emit('video:camera-toggled', {
                roomId,
                enabled: !videoStore.localVideoEnabled
            });
        }
    };

    // Toggle microphone
    const toggleMicrophone = () => {
        videoStore.toggleLocalAudio();
        if (socket) {
            socket.emit('video:microphone-toggled', {
                roomId,
                enabled: !videoStore.localAudioEnabled
            });
        }
    };

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        // Handle participants list
        socket.on('video:participants-list', (data) => {
            const { participants } = data;
            videoStore.setParticipants(participants);

            // Create offers for existing participants
            participants.forEach(participant => {
                createOffer(participant.socketId);
            });
        });

        // Handle new participant joined
        socket.on('video:participant-joined', (data) => {
            videoStore.setParticipants(prev => {
                if (prev.find(p => p.socketId === data.socketId)) return prev;
                return [...prev, data];
            });
        });

        // Handle participant left
        socket.on('video:participant-left', (data) => {
            const { socketId } = data;
            removePeerConnection(socketId);
            videoStore.setParticipants(prev =>
                prev.filter(p => p.socketId !== socketId)
            );
        });

        // Handle WebRTC signaling
        socket.on('video:offer-received', handleOffer);
        socket.on('video:answer-received', handleAnswer);
        socket.on('video:ice-candidate-received', handleIceCandidate);

        return () => {
            socket.off('video:participants-list');
            socket.off('video:participant-joined');
            socket.off('video:participant-left');
            socket.off('video:offer-received');
            socket.off('video:answer-received');
            socket.off('video:ice-candidate-received');
        };
    }, [socket, createOffer, handleOffer, handleAnswer, handleIceCandidate, removePeerConnection]);

    return {
        startVideoCall,
        endVideoCall,
        toggleCamera,
        toggleMicrophone,
        loading,
        localStream,
        ...videoStore
    };
};
