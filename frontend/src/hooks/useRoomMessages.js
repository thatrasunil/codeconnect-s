import { useEffect, useState } from "react";
import realtimeService from "../services/realtimeService";
import { getRoom } from "../services/apiService";

function useRoomMessages(roomId) {
    const [messages, setMessages] = useState([]);

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

        // Listen for new messages
        const unsubscribe = realtimeService.onMessageReceived(roomId, (msg) => {
            setMessages((prev) => {
                // Avoid duplicates
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [roomId]);

    return messages;
}

export default useRoomMessages;
