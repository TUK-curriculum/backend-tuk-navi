const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const NoteService = require('../service/NoteService');

// GET /notes
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notes = await NoteService.list(req.user.userId);
        res.json({ success: true, data: notes });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// POST /notes
router.post('/', authMiddleware, async (req, res) => {
    try {
        const note = await NoteService.create(req.user.userId, req.body);
        res.status(201).json({ success: true, data: note });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// PATCH /notes/:id
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const note = await NoteService.update(req.user.userId, req.params.id, req.body);
        res.json({ success: true, data: note });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE /notes/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await NoteService.remove(req.user.userId, req.params.id);
        res.status(204).json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router; 