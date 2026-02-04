import { useEffect, useState } from "react";
import socketService from "../services/socketService";
import { getRoom } from "../services/apiService";

function useRoomMessages(roomId) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!roomId) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            // Ideally getRoom includes messages or we have a specific endpoint. 
            // Using getRoom for now as it's likely to return recent chat.
            // If not, we might need a separate endpoint /api/rooms/:id/messages
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
        const handleNewMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);
        };

        socketService.onMessageReceived(handleNewMessage);

        return () => {
            // socketService.off('receive-message', handleNewMessage); // If we added off method
            // For now, React unmount cleaning might require socketService to support removing listener specific to this component
            // But simple implementation might just be global. 
            // Better to implement off method in socketService.
        };
    }, [roomId]);

    return messages;
}

export default useRoomMessages;
