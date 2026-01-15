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

module.exports = {
    getChatHistory,
    saveMessage
};
