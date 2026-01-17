import { db } from "../firebase";
import {
    collection,
    addDoc,
    doc,
    setDoc,
    updateDoc,
    serverTimestamp,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    increment,
    getDoc,
    getCountFromServer,
    runTransaction,
    deleteDoc,
    getDocs,
    arrayUnion
} from "firebase/firestore";


/**
 * Initialize or update user document in Firestore
 * Called on login/signup
 */
export const initializeUserInFirestore = async (user) => {
    try {
        const userRef = doc(db, "users", user.uid);

        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "Anonymous",
            photoURL: user.photoURL || null,
            isOnline: true,
            lastActive: serverTimestamp(),
            createdAt: serverTimestamp(), // detailed merge might be better to not overwrite original createdAt
            provider: user.providerData && user.providerData[0] ? user.providerData[0].providerId : "unknown"
        };

        // Use setDoc with merge: true to avoid overwriting existing data fields like createdAt if handled properly, 
        // but here we just want to ensure these fields exist. 
        // If we want to preserve createdAt, we should check existence or use update, but merge is safe for adding new fields.
        // However, merging createdAt every time login happens is wrong.
        // Let's check existence first or just dont include createdAt in the merge if we suspect it exists.
        // For simplicity per guide, we'll just merge what we have.
        // A better approach: distinct creation vs update. 
        // But adhering to the guide provided by user:
        await setDoc(userRef, userData, { merge: true });
        console.log("✅ User initialized in Firestore:", user.uid);
        return userData;
    } catch (error) {
        console.error("❌ Error initializing user:", error);
        // Don't throw, just log, so app flow continues
    }
};

/**
 * Update user's last active timestamp
 * Called periodically
 */
export const updateUserPresence = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            lastActive: serverTimestamp(),
            isOnline: true
        });
    } catch (error) {
        // console.error("❌ Error updating presence:", error);
        // Suppress frequent logs
    }
};

/**
 * Set user as offline
 * Called on logout
 */
export const setUserOffline = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            isOnline: false,
            lastActive: serverTimestamp()
        });
        console.log("✅ User marked offline:", userId);
    } catch (error) {
        console.error("❌ Error setting offline:", error);
    }
};

/**
 * Create interview room document
 */
export const createInterviewRoom = async (roomData) => {
    try {
        const roomRef = doc(collection(db, "interview_rooms"));
        const newRoom = {
            ...roomData,
            createdAt: serverTimestamp(),
            status: "active",
            participants: roomData.participants || []
        };

        await setDoc(roomRef, newRoom);
        console.log("✅ Room created:", roomRef.id);
        return { id: roomRef.id, ...newRoom };
    } catch (error) {
        console.error("❌ Error creating room:", error);
        throw error;
    }
};
/**
 * Log a transaction/action for audit
 */
export const logTransaction = async (userId, actionType, details = {}) => {
    try {
        await addDoc(collection(db, "logs"), {
            userId,
            actionType,
            details,
            timestamp: serverTimestamp()
        });
        // console.log(`📝 Logged: ${actionType}`);
    } catch (error) {
        console.error("❌ Error logging transaction:", error);
    }
};

/**
 * Increment user stats (points, rooms_created, messages_sent)
 */
export const incrementUserStats = async (userId, type) => {
    try {
        const userRef = doc(db, "users", userId);
        const updates = {};

        if (type === 'room') {
            updates.rooms = increment(1);
            updates.points = increment(10); // 10 points for creating a room
        } else if (type === 'message') {
            updates.messages = increment(1);
            updates.points = increment(1); // 1 point for sending a message
        }

        await updateDoc(userRef, updates);
    } catch (error) {
        console.error("Error incrementing stats:", error);
    }
};

/**
 * Subscribe to leaderboard updates
 */
export const subscribeToLeaderboard = (callback) => {
    const q = query(
        collection(db, "users"),
        orderBy("points", "desc"),
        limit(10)
    );

    return onSnapshot(q, (snapshot) => {
        const leaderboardData = [];
        snapshot.forEach((doc) => {
            leaderboardData.push(doc.data());
        });
        callback(leaderboardData);
    }, (error) => {
        console.error("❌ Leaderboard subscription error:", error);
    });
};

/**
 * Subscribe to online users count and list
 */
export const subscribeToOnlineUsers = (callback) => {
    const q = query(
        collection(db, "users"),
        where("isOnline", "==", true)
    );

    return onSnapshot(q, (snapshot) => {
        const users = [];
        snapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        callback(users);
    }, (error) => {
        console.error("❌ Online users subscription error:", error);
    });
};

// --- New Realtime Services ---

/**
 * Subscribe to a specific room's metadata
 */
export const subscribeToRoom = (roomId, callback) => {
    return onSnapshot(doc(db, "rooms", roomId), (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() });
        } else {
            callback(null);
        }
    });
};

/**
 * Subscribe to room participants (Members)
 */
export const subscribeToRoomMembers = (roomId, callback) => {
    const q = query(
        collection(db, "roomMembers"),
        where("roomId", "==", roomId)
    );

    return onSnapshot(q, (snapshot) => {
        const members = [];
        snapshot.forEach((doc) => {
            members.push({ id: doc.id, ...doc.data() });
        });
        callback(members);
    });
};

/**
 * Subscribe to room messages
 */
export const subscribeToMessages = (roomId, callback) => {
    const q = query(
        collection(db, "messages"),
        where("roomId", "==", roomId),
        orderBy("createdAt", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Convert Timestamp to Date object for easier handling in UI
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
            messages.push({ id: doc.id, ...data, createdAt });
        });
        callback(messages);
    }, (error) => {
        console.error("❌ Messages subscription error:", error);
    });
};

/**
 * Join a room (update roomMembers)
 */
export const joinRoom = async (roomId, user) => {
    if (!user) return;
    const userId = user.id || user.uid; // Support both AuthContext user and raw Firebase user
    const memberId = `${userId}_${roomId}`;
    const memberRef = doc(db, "roomMembers", memberId);

    // We can allow users to "update" their status to online just by joining
    await setDoc(memberRef, {
        roomId,
        userId: userId,
        displayName: user.displayName || user.username || "Anonymous",
        status: 'online',
        lastActive: serverTimestamp(),
        role: 'participant' // Default role
    }, { merge: true });

    return memberId;
};

/**
 * Update User Status in a Room (for heartbeat)
 */
export const updateUserStatus = async (roomId, userId, status) => {
    if (!userId) return;
    const memberId = `${userId}_${roomId}`;
    const memberRef = doc(db, "roomMembers", memberId);

    try {
        await updateDoc(memberRef, {
            status,
            lastActive: serverTimestamp()
        });
    } catch (e) {
        // Warning: if doc doesn't exist, updateDoc fails. 
        // Silent fail is acceptable for heartbeat noise, or we could use setDoc with merge.
    }
};

/**
 * Send a message
 */
export const sendMessage = async (roomId, messageData) => {
    await addDoc(collection(db, "messages"), {
        roomId,
        ...messageData,
        createdAt: serverTimestamp()
    });
};

/**
 * Create generic room (Milestone 1)
 */
export const createRoom = async (roomData) => {
    try {
        let roomId;
        let roomRef;
        let isUnique = false;
        let attempts = 0;

        // Generate unique 6-digit numeric ID
        while (!isUnique && attempts < 5) {
            roomId = Math.floor(100000 + Math.random() * 900000).toString();
            roomRef = doc(db, "rooms", roomId);
            const docSnap = await getDoc(roomRef);
            if (!docSnap.exists()) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            throw new Error("Failed to generate a unique numeric Room ID. Please try again.");
        }

        const newRoom = {
            title: roomData.title || "Untitled Room",
            ownerId: roomData.ownerId,
            isPublic: roomData.isPublic !== false,
            createdAt: serverTimestamp(),
            language: roomData.language || "javascript",
            participantsCount: 0,
            room_id: roomId, // Store numeric ID field as well
            ...roomData
        };

        await setDoc(roomRef, newRoom);
        console.log("✅ Room created in 'rooms' with ID:", roomId);
        return { id: roomId, ...newRoom };
    } catch (error) {
        console.error("❌ Error creating room:", error);
        throw error;
    }
};


/**
 * Update the code content of a room
 */
export const updateRoomCode = async (roomId, code, language) => {
    try {
        const roomRef = doc(db, "rooms", roomId);
        const updates = {
            lastModified: serverTimestamp(),
            code: code
        };
        if (language) updates.language = language;

        await updateDoc(roomRef, updates);
    } catch (error) {
        console.error("❌ Error updating room code:", error);
    }
};

/**
 * Update typing status for a user in a room
 * Uses a subcollection 'typing' with docs named by userId
 */
export const updateTypingStatus = async (roomId, userId, isTyping) => {
    try {
        if (!roomId || !userId) return;
        const typingRef = doc(db, "rooms", roomId, "typing", userId);

        if (isTyping) {
            await setDoc(typingRef, {
                userId,
                isTyping: true,
                timestamp: serverTimestamp()
            });
        } else {
            await deleteDoc(typingRef);
        }
    } catch (error) {
        // console.error("Error updating typing status:", error);
    }
};

/**
 * Subscribe to active typing users
 */
export const subscribeToTyping = (roomId, callback) => {
    const q = query(
        collection(db, "rooms", roomId, "typing"),
        orderBy("timestamp", "desc") // Simplistic, might need cleanup of old entries
    );

    return onSnapshot(q, (snapshot) => {
        const typingUsers = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Filter out stale typing indicators (> 5 seconds old)
            // Note: client clocks might differ, but serverTimestamp helps.
            // For now, just return all, client can filter or we rely on delete on blur
            if (data.isTyping) typingUsers.push(data.userId);
        });
        callback(typingUsers);
    });
};

/**
 * Add a reaction to a message
 */
/**
 * Toggle a reaction on a message (Add or Remove)
 */
export const toggleMessageReaction = async (roomId, messageId, reactionEmoji, userId) => {
    try {
        const messageRef = doc(db, "messages", messageId);

        await runTransaction(db, async (transaction) => {
            const messageDoc = await transaction.get(messageRef);
            if (!messageDoc.exists()) {
                throw new Error("Message does not exist!");
            }

            const data = messageDoc.data();
            const reactions = data.reactions || [];

            // Check if user already reacted with this emoji
            const existingIndex = reactions.findIndex(
                (r) => r.userId === userId && (r.emoji === reactionEmoji || r === reactionEmoji)
            );

            let newReactions = [...reactions];

            if (existingIndex !== -1) {
                // User already reacted -> Remove it
                newReactions.splice(existingIndex, 1);
            } else {
                // User hasn't reacted -> Add it
                // We purposefully omit timestamp to make equality checks easier if we ever move to arrayUnion/Remove
                // But for now, we just stick to this object structure without timestamp for simplicity
                newReactions.push({
                    emoji: reactionEmoji,
                    userId: userId
                });
            }

            transaction.update(messageRef, { reactions: newReactions });
        });

    } catch (error) {
        console.error("Error toggling reaction:", error);
    }
};

/**
 * Fetch specific user data (stats)
 */
export const fetchUserData = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};

/**
 * Fetch rooms created by a user
 */
/**
 * Fetch rooms created by a user
 */
export const fetchUserRooms = async (userId) => {
    try {
        const q = query(
            collection(db, "rooms"),
            where("ownerId", "==", userId)
        );
        const snapshot = await getDocs(q);
        const rooms = [];
        snapshot.forEach(doc => {
            rooms.push({
                id: doc.id,
                room_id: doc.data().room_id || doc.id,
                ...doc.data(),
                created_at: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
            });
        });

        // Client-side sort and limit to avoid needing a composite index
        rooms.sort((a, b) => b.created_at - a.created_at);
        return rooms.slice(0, 10);
    } catch (error) {
        console.error("Error fetching user rooms:", error);
        return [];
    }
};

/**
 * Subscribe to whiteboard drawings
 */
export const subscribeToWhiteboard = (roomId, callback) => {
    const q = query(
        collection(db, "whiteboard"),
        where("roomId", "==", roomId),
        orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const drawings = [];
        snapshot.forEach((doc) => {
            drawings.push({ id: doc.id, ...doc.data() });
        });
        callback(drawings);
    }, (error) => {
        console.error("❌ Whiteboard subscription error:", error);
    });
};

/**
 * Add a drawing action to whiteboard
 */
export const addWhiteboardAction = async (roomId, action) => {
    try {
        await addDoc(collection(db, "whiteboard"), {
            roomId,
            ...action,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("❌ Error adding whiteboard action:", error);
    }
};

/**
 * Clear whiteboard
 */
export const clearWhiteboard = async (roomId) => {
    try {
        const q = query(
            collection(db, "whiteboard"),
            where("roomId", "==", roomId)
        );
        const snapshot = await getDocs(q);

        const deletePromises = [];
        snapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });

        await Promise.all(deletePromises);
        console.log("✅ Whiteboard cleared");
    } catch (error) {
        console.error("❌ Error clearing whiteboard:", error);
    }
};

