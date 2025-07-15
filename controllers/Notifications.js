const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const NotificationService = require('../service/NotificationService');

// GET /notifications
router.get('/', authMiddleware, async (req, res) => {
    try {
        const list = await NotificationService.list(req.user.userId);
        res.json(list);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /notifications/read (body: { ids: [] })
router.put('/read', authMiddleware, async (req, res) => {
    try {
        const { ids = [] } = req.body;
        await NotificationService.markRead(req.user.userId, ids);
        res.status(200).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /notifications/:id/read
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        await NotificationService.markRead(req.user.userId, [req.params.id]);
        res.status(200).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router; 