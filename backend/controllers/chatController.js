const admin = require('firebase-admin');

const getChatHistory = async (req, res, db, localRooms) => {
    const { roomId } = req.query;
    try {
        let messages = [];
        if (db) { // Firestore available
            if (roomId) {
                const doc = await db.collection('rooms').doc(roomId).get();
                if (doc.exists) messages = doc.data().messages || [];
            } else {
                // Fetch global or landing page chats if implemented
            }
        } else {
            const room = localRooms.get(roomId);
            messages = room ? room.messages : [];
        }

        // Pagination could be added here
        res.json({ messages, totalCount: messages.length });
    } catch (err) {
        console.error('Error fetching chat history:', err);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
};

const saveMessage = async (req, res, db, localRooms) => {
    const { message, roomId, type } = req.body;

    if (!roomId || !message) {
        return res.status(400).json({ error: 'Missing roomId or message' });
    }

    const newMessage = {
        ...message,
        id: Date.now(),
        timestamp: new Date().toISOString()
    };

    try {
        if (db) {
            await db.collection('rooms').doc(roomId).update({
                messages: admin.firestore.FieldValue.arrayUnion(newMessage)
            });
        } else {
            const room = localRooms.get(roomId);
            if (room) {
                if (!room.messages) room.messages = [];
                room.messages.push(newMessage);
            }
        }

        // Note: detailed broadcasting is handled via Socket.IO in server.js, 
        // or we could emit from here if we passed the io instance.
        // For now, this endpoint assumes REST-based saving (e.g. from a non-socket client).

        res.json({ success: true, message: newMessage });
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ error: 'Failed to save message' });
    }
};

const handleLandingChat = async (req, res) => {
    const { message, page, userId } = req.body;

    // Basic logging/analytics could go here (e.g. store in Firestore 'leads' collection)
    console.log(`Landing Chat [${page || 'unknown'}] - User ${userId || 'guest'}: ${message}`);

    const lowerMsg = message.toLowerCase().trim().replace(/[^\w\s]/gi, ''); // Remove punctuation

    let reply = "";
    let quickReplies = ["How to create a room?", "Is it free?", "Features"];

    // Rule-based keyword matching
    if (lowerMsg.includes('free') || lowerMsg.includes('pricing') || lowerMsg.includes('cost')) {
        reply = "CodeConnect is currently 100% free for all users during our beta period. You get unlimited rooms and real-time collaboration!";
        quickReplies = ["Create a Room", "Do I need an account?"];
    }
    else if (lowerMsg.includes('account') || lowerMsg.includes('signup') || lowerMsg.includes('login') || lowerMsg.includes('register')) {
        reply = "You can create rooms and code as a guest instantly! However, creating an account allows you to save your history, track stats on the leaderboard, and customize your profile.";
        quickReplies = ["Is it free?", "Start Coding Now"];
    }
    else if (lowerMsg.includes('realtime') || lowerMsg.includes('latency') || lowerMsg.includes('sync') || lowerMsg.includes('collab')) {
        reply = "We primarily use WebSocket connections with < 50ms latency for instant synchronization. Changes are broadcast immediately to all users in the room.";
        quickReplies = ["How many users?", "Supported languages"];
    }
    else if (lowerMsg.includes('language') || lowerMsg.includes('support')) {
        reply = "We support execution for JavaScript, Python, Java, C++, Go, Rust, and TypeScript. Syntax highlighting is available for many more!";
        quickReplies = ["Start Coding Now"];
    }
    else if (lowerMsg.includes('create') || lowerMsg.includes('start') || lowerMsg.includes('room')) {
        reply = "To create a room, just click the 'Start Coding Now' button. It takes less than a second!";
        quickReplies = [];
    }
    else {
        reply = "I may not have that specific answer yet, but here's what I can help with: pricing, features, account set up. Try one of the options below.";
        quickReplies = ["Is it free?", "How to create a room?", "Supported languages"];
    }

    res.json({ reply, quickReplies });
};

module.exports = {
    getChatHistory,
    saveMessage,
    handleLandingChat
};
