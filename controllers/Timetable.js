const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const TimetableService = require('../service/TimetableService');

// GET /timetable/current
router.get('/current', authMiddleware, async (req, res) => {
    try {
        const data = await TimetableService.getCurrent(req.user.userId);
        res.json(data || {});
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /timetable/save
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const saved = await TimetableService.save(req.user.userId, req.body);
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /timetable/history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const list = await TimetableService.getHistory(req.user.userId);
        res.json(list);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const TimetableService = require('../service/TimetableService');

// GET /timetable/current
router.get('/current', authMiddleware, async (req, res) => {
    try {
        const data = await TimetableService.getCurrent(req.user.userId);
        res.json(data || {});
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /timetable/save
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const saved = await TimetableService.save(req.user.userId, req.body);
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /timetable/history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const list = await TimetableService.getHistory(req.user.userId);
        res.json(list);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router; 