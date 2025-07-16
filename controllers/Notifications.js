const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const NotificationService = require('../service/NotificationService');

// GET /notifications
router.get('/', authMiddleware, async (req, res) => {
    try {
        const list = await NotificationService.list(req.user.userId);
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// PUT /notifications/read (body: { ids: [] })
router.put('/read', authMiddleware, async (req, res) => {
    try {
        const { ids = [] } = req.body;
        await NotificationService.markRead(req.user.userId, ids);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// PUT /notifications/:id/read
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        await NotificationService.markRead(req.user.userId, [req.params.id]);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router; 