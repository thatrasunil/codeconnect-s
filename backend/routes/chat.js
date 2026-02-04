const express = require('express');
const router = express.Router();
// Chat logic is now mostly in server.js, but if we keep this for history/REST API:
const Room = require('../models/Room');

module.exports = (db, localRooms) => {
    // GET /api/chat/history?roomId=...
    router.get('/history', async (req, res) => {
        const { roomId } = req.query;
        if (!roomId) return res.status(400).json({ error: 'roomId required' });

        try {
            const room = await Room.findOne({ roomId });
            res.json(room ? room.messages : []);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // POST /api/chat/messages
    // Often unused if using socket.io, but good for backup or widgets
    router.post('/messages', async (req, res) => {
        const { roomId, content, userId, username } = req.body;

        try {
            const newMessage = {
                userId,
                username,
                content,
                type: 'text',
                timestamp: new Date()
            };

            await Room.updateOne(
                { roomId },
                { $push: { messages: newMessage } }
            );

            res.json(newMessage);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    // POST /api/chat (Landing Widget - generic AI or simple store)
    router.post('/', (req, res) => {
        // Implement landing chat bot or similar
        res.json({ message: "Chat service active" });
    });

    return router;
};
