import { useEffect, useState } from "react";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase"; // your firebase init

function useRoomMessages(roomId) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!roomId) return;

        const messagesRef = collection(db, "rooms", roomId, "messages");
        const q = query(messagesRef, orderBy("createdAt", "asc"));

        const unsub = onSnapshot(q, (snapshot) => {
            const docs = [];
            snapshot.forEach((doc) => {
                docs.push({ id: doc.id, ...doc.data() });
            });
            setMessages(docs);
        });

        return () => unsub();
    }, [roomId]);

    return messages;
}

export default useRoomMessages;
