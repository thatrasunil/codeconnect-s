import { useEffect, useState, useCallback, useRef } from "react";
import realtimeService from "../services/realtimeService";
import { getRoom } from "../services/apiService";

function useRoomMessages(roomId, onMessageReceived) {
    const [messages, setMessages] = useState([]);
    // Track optimistic message IDs so we can deduplicate when Firestore echoes them
    const optimisticIds = useRef(new Set());
    const onMessageReceivedRef = useRef(onMessageReceived);

    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        if (!roomId) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            try {
                const roomData = await getRoom(roomId);
                if (roomData && roomData.messages) {
                    setMessages(roomData.messages);
                }
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };

        fetchMessages();

        // Listen for new messages from Firestore
        const unsubscribe = realtimeService.onMessageReceived(roomId, (msg) => {
            setMessages((prev) => {
                // If this message was added optimistically, replace it with the real one
                const optimisticIndex = prev.findIndex(
                    m => m._optimistic && m.content === msg.content && m.senderName === msg.senderName
                );

                // Ignore if it's optimistic or if exact ID already exists
                const isOptimisticOrExists = optimisticIndex !== -1 || prev.find(m => m.id === msg.id);

                // Trigger callback if it's genuinely a new message arriving from the network
                if (!isOptimisticOrExists && onMessageReceivedRef.current) {
                    onMessageReceivedRef.current(msg);
                }

                if (optimisticIndex !== -1) {
                    // Replace optimistic message with real Firestore message
                    const updated = [...prev];
                    updated[optimisticIndex] = msg;
                    return updated;
                }
                // Avoid exact id duplicates
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [roomId]);

    // Call this immediately when user sends a message for instant display
    const addOptimisticMessage = useCallback((msgData) => {
        const optimisticMsg = {
            ...msgData,
            id: 'optimistic_' + Date.now(),
            _optimistic: true,
            timestamp: new Date(),
            createdAt: new Date()
        };
        setMessages(prev => [...prev, optimisticMsg]);
    }, []);

    return { messages, addOptimisticMessage };
}

export default useRoomMessages;
