// src/hooks/useLocalStream.js
import { useEffect, useState } from 'react';
import { useVideoStore } from '../store/videoStore';

export const useLocalStream = () => {
    const {
        setLocalStream,
        localVideoEnabled,
        localAudioEnabled,
        setError,
        localStream
    } = useVideoStore();
    const [loading, setLoading] = useState(false);

    const getLocalStream = async () => {
        try {
            setLoading(true);

            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
            setLoading(false);
            return stream;
        } catch (error) {
            console.error('Error getting local stream:', error);
            setError(`Camera/Mic access denied: ${error.message}`);
            setLoading(false);
            return null;
        }
    };

    // Handle video track enable/disable
    useEffect(() => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = localVideoEnabled;
            });
        }
    }, [localVideoEnabled, localStream]);

    // Handle audio track enable/disable
    useEffect(() => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = localAudioEnabled;
            });
        }
    }, [localAudioEnabled, localStream]);

    const stopLocalStream = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
    };

    return {
        getLocalStream,
        stopLocalStream,
        loading,
        localStream
    };
};
