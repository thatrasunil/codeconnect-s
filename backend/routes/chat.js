const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

module.exports = (db, localRooms) => {
    // GET /api/chat/history?roomId=...
    router.get('/history', (req, res) => chatController.getChatHistory(req, res, db, localRooms));

    // POST /api/chat/messages
    router.post('/messages', (req, res) => chatController.saveMessage(req, res, db, localRooms));

    // POST /api/chat (Landing Widget)
    router.post('/', (req, res) => chatController.handleLandingChat(req, res));

    return router;
};
