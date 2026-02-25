// src/hooks/usePeerConnections.js
import { useRef, useCallback } from 'react';
import { useVideoStore } from '../store/videoStore';

// STUN servers for NAT traversal
const STUN_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
];

export const usePeerConnections = (socket, localStream) => {
    const peerConnections = useRef(new Map()); // socketId -> RTCPeerConnection
    const { setRemoteStreams, removeRemoteStream, roomId } = useVideoStore();

    // Remove peer connection
    const removePeerConnection = useCallback((peerId) => {
        const peerConnection = peerConnections.current.get(peerId);

        if (peerConnection) {
            peerConnection.close();
            peerConnections.current.delete(peerId);
            removeRemoteStream(peerId);
        }
    }, [removeRemoteStream]);

    // Create peer connection
    const createPeerConnection = useCallback((peerId) => {
        if (peerConnections.current.has(peerId)) {
            return peerConnections.current.get(peerId);
        }

        const peerConnection = new RTCPeerConnection({
            iceServers: STUN_SERVERS
        });

        // Add local tracks
        if (localStream) {
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('video:ice-candidate', {
                    to: peerId,
                    candidate: event.candidate,
                    roomId: useVideoStore.getState().roomId || roomId
                });
            }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log(`Connection state with ${peerId}:`, peerConnection.connectionState);

            if (peerConnection.connectionState === 'disconnected' ||
                peerConnection.connectionState === 'failed' ||
                peerConnection.connectionState === 'closed') {
                removePeerConnection(peerId);
            }
        };

        // Handle remote stream
        peerConnection.ontrack = (event) => {
            console.log('Remote track received:', event.track.kind);
            const remoteStream = event.streams[0];
            setRemoteStreams(peerId, remoteStream);
        };

        peerConnections.current.set(peerId, peerConnection);
        return peerConnection;
    }, [localStream, socket, removePeerConnection, roomId, setRemoteStreams]);

    // Create and send offer
    const createOffer = useCallback(async (peerId) => {
        try {
            const peerConnection = createPeerConnection(peerId);

            const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });

            await peerConnection.setLocalDescription(offer);

            socket.emit('video:offer', {
                to: peerId,
                offer: peerConnection.localDescription,
                roomId: useVideoStore.getState().roomId || roomId
            });
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }, [createPeerConnection, socket, roomId]);

    // Handle received offer
    const handleOffer = useCallback(async (data) => {
        try {
            const { from, offer } = data;
            const peerConnection = createPeerConnection(from);

            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socket.emit('video:answer', {
                to: from,
                answer: peerConnection.localDescription,
                roomId: useVideoStore.getState().roomId || roomId
            });
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }, [createPeerConnection, socket, roomId]);

    // Handle received answer
    const handleAnswer = useCallback(async (data) => {
        try {
            const { from, answer } = data;
            const peerConnection = peerConnections.current.get(from);

            if (peerConnection) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }, []);

    // Handle ICE candidate
    const handleIceCandidate = useCallback(async (data) => {
        try {
            const { from, candidate } = data;
            const peerConnection = peerConnections.current.get(from);

            if (peerConnection && candidate) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }, []);

    // Close all connections
    const closeAllConnections = useCallback(() => {
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();
    }, []);

    return {
        createOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        removePeerConnection,
        closeAllConnections,
        peerConnections
    };
};
