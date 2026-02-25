import { db } from '../firebase';
import {
    doc,
    onSnapshot,
    updateDoc,
    collection,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    setDoc,
    getDoc
} from 'firebase/firestore';

class RealtimeService {
    constructor() {
        this.unsubscribeRoom = null;
        this.unsubscribeMessages = null;
    }

    // Initialize/Join Room in Firestore
    async joinRoom(roomId, user) {
        const roomRef = doc(db, 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);

        if (!roomSnap.exists()) {
            // Create room document if it doesn't exist
            await setDoc(roomRef, {
                roomId,
                code: '// Write your code here...',
                language: 'javascript',
                lastUpdated: serverTimestamp(),
                participants: [user]
            });
        } else {
            // Update participants list (simplified)
            const currentParticipants = roomSnap.data().participants || [];
            if (!currentParticipants.find(p => p.uid === user.uid)) {
                await updateDoc(roomRef, {
                    participants: [...currentParticipants, user]
                });
            }
        }
    }

    // Code Synchronization
    sendCodeChange(roomId, { code, language }) {
        const roomRef = doc(db, 'rooms', roomId);
        updateDoc(roomRef, {
            code,
            language,
            lastUpdated: serverTimestamp()
        }).catch(err => console.error("Firestore sync error:", err));
    }

    onCodeChange(roomId, callback) {
        if (this.unsubscribeRoom) this.unsubscribeRoom();

        const roomRef = doc(db, 'rooms', roomId);
        this.unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                callback({ code: data.code, language: data.language });
            }
        });
        return this.unsubscribeRoom;
    }

    // Chat Synchronization
    async sendMessage(roomId, messageData) {
        const messagesRef = collection(db, 'rooms', roomId, 'messages');
        await addDoc(messagesRef, {
            ...messageData,
            timestamp: serverTimestamp()
        });
    }

    onMessageReceived(roomId, callback) {
        if (this.unsubscribeMessages) this.unsubscribeMessages();

        const messagesRef = collection(db, 'rooms', roomId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        this.unsubscribeMessages = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    // Convert Firestore timestamp to Date or ISO string if needed
                    const message = {
                        ...data,
                        id: change.doc.id,
                        timestamp: data.timestamp?.toDate() || new Date()
                    };
                    callback(message);
                }
            });
        });
        return this.unsubscribeMessages;
    }

    // Typing Status (Simplified - we can use a separate collection)
    sendTyping(roomId, { user, isTyping }) {
        const typingRef = doc(db, 'rooms', roomId, 'typing', user);
        setDoc(typingRef, {
            user,
            isTyping,
            lastUpdated: serverTimestamp()
        }).catch(err => console.error("Typing sync error:", err));
    }

    onTyping(roomId, callback) {
        const typingCollectionRef = collection(db, 'rooms', roomId, 'typing');
        return onSnapshot(typingCollectionRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const data = change.doc.data();
                callback({ user: data.user, isTyping: data.isTyping });
            });
        });
    }

    // Whiteboard Sync
    sendDraw(roomId, drawingData) {
        const drawsRef = collection(db, 'rooms', roomId, 'drawings');
        addDoc(drawsRef, {
            ...drawingData,
            timestamp: serverTimestamp()
        }).catch(err => console.error("Drawing sync error:", err));
    }

    onDraw(roomId, callback) {
        const drawsRef = collection(db, 'rooms', roomId, 'drawings');
        const q = query(drawsRef, orderBy('timestamp', 'asc'));
        return onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    callback(change.doc.data());
                }
            });
        });
    }

    // Reaction Sync
    sendReaction(roomId, messageId, emoji) {
        const reactionRef = doc(db, 'rooms', roomId, 'messages', messageId, 'reactions', emoji);
        setDoc(reactionRef, {
            count: 1, // Simple increment or state management needed for full feature
            lastUpdated: serverTimestamp()
        }).catch(err => console.error("Reaction sync error:", err));
    }

    onReaction(roomId, messageId, callback) {
        const reactionsCollectionRef = collection(db, 'rooms', roomId, 'messages', messageId, 'reactions');
        return onSnapshot(reactionsCollectionRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                callback({ messageId, emoji: change.doc.id, ...change.doc.data() });
            });
        });
    }

    disconnect() {
        if (this.unsubscribeRoom) this.unsubscribeRoom();
        if (this.unsubscribeMessages) this.unsubscribeMessages();
    }
}

const realtimeService = new RealtimeService();
export default realtimeService;
