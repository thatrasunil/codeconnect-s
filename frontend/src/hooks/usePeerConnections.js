// src/hooks/usePeerConnections.js
import { useRef, useCallback } from 'react';
import { db } from '../firebase';
import {
    collection,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { useVideoStore } from '../store/videoStore';

// STUN servers for NAT traversal
const STUN_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
];

export const usePeerConnections = (localStream) => {
    const peerConnections = useRef(new Map()); // peerId -> RTCPeerConnection
    const { setRemoteStreams, removeRemoteStream, roomId, currentUser } = useVideoStore();

    const currentUserId = currentUser?.uid || currentUser?.id;

    // Send signaling message via Firestore
    const sendSignalingMessage = useCallback(async (to, type, data) => {
        if (!roomId || !currentUserId) return;

        try {
            await addDoc(collection(db, 'rooms', roomId, 'signaling'), {
                from: currentUserId,
                to: to,
                type: type,
                data: JSON.stringify(data),
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error(`Error sending signaling ${type}:`, error);
        }
    }, [roomId, currentUserId]);

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
                sendSignalingMessage(peerId, 'candidate', event.candidate);
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
    }, [localStream, sendSignalingMessage, removePeerConnection, setRemoteStreams]);

    // Create and send offer
    const createOffer = useCallback(async (peerId) => {
        try {
            const peerConnection = createPeerConnection(peerId);

            const offer = await peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });

            await peerConnection.setLocalDescription(offer);

            await sendSignalingMessage(peerId, 'offer', peerConnection.localDescription);
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }, [createPeerConnection, sendSignalingMessage]);

    // Handle ICE candidate
    const handleIceCandidate = useCallback(async (peerId, candidate) => {
        try {
            const peerConnection = peerConnections.current.get(peerId);

            if (peerConnection && candidate) {
                // If remote description is already set, add immediately
                if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                } else {
                    // Buffer candidate if remote description is not yet set
                    if (!peerConnection._candidateQueue) {
                        peerConnection._candidateQueue = [];
                    }
                    peerConnection._candidateQueue.push(candidate);
                    console.log(`Buffered ICE candidate for ${peerId}`);
                }
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }, []);

    // Helper to flush buffered candidates
    const flushCandidates = useCallback(async (peerId) => {
        const peerConnection = peerConnections.current.get(peerId);
        if (peerConnection && peerConnection._candidateQueue) {
            console.log(`Flushing ${peerConnection._candidateQueue.length} candidates for ${peerId}`);
            while (peerConnection._candidateQueue.length > 0) {
                const candidate = peerConnection._candidateQueue.shift();
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error('Error flushing candidate:', e);
                }
            }
        }
    }, []);

    // Handle received offer (updated to flush candidates)
    const handleOffer = useCallback(async (peerId, offer) => {
        try {
            const peerConnection = createPeerConnection(peerId);

            if (peerConnection.signalingState !== 'stable') {
                console.warn(`Ignoring offer for ${peerId} in state ${peerConnection.signalingState}`);
                return;
            }

            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            // Flush buffered candidates
            await flushCandidates(peerId);

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            await sendSignalingMessage(peerId, 'answer', peerConnection.localDescription);
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }, [createPeerConnection, sendSignalingMessage, flushCandidates]);

    // Handle received answer (updated to flush candidates)
    const handleAnswer = useCallback(async (peerId, answer) => {
        try {
            const peerConnection = peerConnections.current.get(peerId);

            if (peerConnection) {
                if (peerConnection.signalingState !== 'have-local-offer') {
                    console.warn(`Ignoring answer for ${peerId} in state ${peerConnection.signalingState}`);
                    return;
                }
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

                // Flush buffered candidates
                await flushCandidates(peerId);
            }
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }, [flushCandidates]);

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
