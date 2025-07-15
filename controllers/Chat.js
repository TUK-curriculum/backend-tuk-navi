const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const ChatService = require('../service/ChatService');

// POST /chat/messages
router.post('/messages', authMiddleware, async (req, res) => {
    try {
        const { content, msgType, metadata } = req.body;
        const saved = await ChatService.addMessage(req.user.userId, { content, sender: 'user', msgType, metadata });
        // TODO: integrate assistant response generator (placeholder)
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /chat/history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const list = await ChatService.history(req.user.userId, parseInt(req.query.limit) || 100);
        res.json(list);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router; 