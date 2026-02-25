// src/hooks/useVideoCall.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { db } from '../firebase';
import {
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    collection,
    query,
    where,
    limit,
    orderBy,
    serverTimestamp,
    getDocs,
    writeBatch
} from 'firebase/firestore';
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
    } = usePeerConnections(localStream);

    const [loading, setLoading] = useState(false);
    const signalingUnsubscribe = useRef(null);
    const participantsUnsubscribe = useRef(null);
    const currentUserId = currentUser?.uid || currentUser?.id;

    // cleanup signaling
    const cleanupSignaling = useCallback(async () => {
        if (!roomId || !currentUserId) return;

        try {
            // Remove participant document
            await deleteDoc(doc(db, 'rooms', roomId, 'participants', currentUserId));

            // Cleanup signaling messages for me
            const q = query(collection(db, 'rooms', roomId, 'signaling'), where('to', '==', currentUserId));
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.forEach(d => batch.delete(d.ref));
            await batch.commit();
        } catch (error) {
            console.error('Error cleaning up signaling:', error);
        }
    }, [roomId, currentUserId]);

    // Start video call
    const startVideoCall = async () => {
        if (!roomId || !currentUserId) return;

        try {
            setLoading(true);

            // 1. Get local stream
            const stream = await getLocalStream();
            if (!stream) {
                throw new Error('Failed to get local stream');
            }

            // 2. Set room info
            videoStore.setRoomInfo(roomId, currentUser);
            videoStore.setCallActive(true);

            // 3. Register participant in Firestore
            const userData = {
                userId: currentUserId,
                userName: currentUser.displayName || currentUser.username || 'Guest',
                userAvatar: currentUser.photoURL || currentUser.avatar || null,
                joinedAt: Date.now(),
                videoEnabled: videoStore.localVideoEnabled,
                audioEnabled: videoStore.localAudioEnabled
            };

            await setDoc(doc(db, 'rooms', roomId, 'participants', currentUserId), userData);

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
            await cleanupSignaling();
            closeAllConnections();
            stopLocalStream();
            videoStore.reset();
        } catch (error) {
            console.error('Error ending video call:', error);
        }
    };

    // Listen for Participants
    useEffect(() => {
        if (!videoStore.isCallActive || !roomId || !currentUserId) return;

        const q = collection(db, 'rooms', roomId, 'participants');
        participantsUnsubscribe.current = onSnapshot(q, (snapshot) => {
            const participantsList = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.userId !== currentUserId) {
                    participantsList.push({
                        ...data,
                        peerId: data.userId // Use userId as peerId
                    });
                }
            });

            // Calculate diffs to handle joining/leaving
            const currentParticipants = videoStore.participants;

            // New participants
            participantsList.forEach(p => {
                const exists = currentParticipants.find(cp => cp.userId === p.userId);
                if (!exists) {
                    console.log('New participant detected:', p.userId);
                    // In Firestore WebRTC, one peer initiates (usually the newcomer)
                    // Or we use a lexicographical rule
                    if (currentUserId < p.userId) {
                        createOffer(p.userId);
                    }
                }
            });

            // Departed participants
            currentParticipants.forEach(p => {
                const stillActive = participantsList.find(ap => ap.userId === p.userId);
                if (!stillActive) {
                    removePeerConnection(p.userId);
                }
            });

            videoStore.setParticipants(participantsList);
        });

        return () => {
            if (participantsUnsubscribe.current) participantsUnsubscribe.current();
        };
    }, [videoStore.isCallActive, roomId, currentUserId, createOffer, removePeerConnection]);

    // Listen for Signaling Messages
    useEffect(() => {
        if (!videoStore.isCallActive || !roomId || !currentUserId) return;

        const signalingQuery = query(
            collection(db, 'rooms', roomId, 'signaling'),
            where('to', '==', currentUserId)
        );

        signalingUnsubscribe.current = onSnapshot(signalingQuery, (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const fromPeer = data.from;
                    const msgData = JSON.parse(data.data);

                    console.log(`Signaling received: ${data.type} from ${fromPeer}`);

                    switch (data.type) {
                        case 'offer':
                            await handleOffer(fromPeer, msgData);
                            break;
                        case 'answer':
                            await handleAnswer(fromPeer, msgData);
                            break;
                        case 'candidate':
                            await handleIceCandidate(fromPeer, msgData);
                            break;
                        default:
                            break;
                    }

                    // Delete signaling message after processing
                    await deleteDoc(change.doc.ref);
                }
            });
        });

        return () => {
            if (signalingUnsubscribe.current) signalingUnsubscribe.current();
        };
    }, [videoStore.isCallActive, roomId, currentUserId, handleOffer, handleAnswer, handleIceCandidate]);

    // Toggle camera
    const toggleCamera = async () => {
        videoStore.toggleLocalVideo();
        if (roomId && currentUserId) {
            await setDoc(doc(db, 'rooms', roomId, 'participants', currentUserId), {
                videoEnabled: !videoStore.localVideoEnabled
            }, { merge: true });
        }
    };

    // Toggle microphone
    const toggleMicrophone = async () => {
        videoStore.toggleLocalAudio();
        if (roomId && currentUserId) {
            await setDoc(doc(db, 'rooms', roomId, 'participants', currentUserId), {
                audioEnabled: !videoStore.localAudioEnabled
            }, { merge: true });
        }
    };

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
