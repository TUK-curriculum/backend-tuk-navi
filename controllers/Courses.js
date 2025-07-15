const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const CourseService = require('../service/CourseService');

// List courses with pagination & filter
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { page, limit, ...filter } = req.query;
        const courses = await CourseService.list({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            filter
        });
        res.json(courses);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Search (alias)
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const courses = await CourseService.search(req.query);
        res.json(courses);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const course = await CourseService.getById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Create (admin only placeholder)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const course = await CourseService.create(req.body);
        res.status(201).json(course);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const course = await CourseService.update(req.params.id, req.body);
        res.json(course);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await CourseService.remove(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ===== Enrollment =====
router.post('/enroll', authMiddleware, async (req, res) => {
    try {
        const { courseId, studentId, semester } = req.body;
        await CourseService.enroll({ courseId, studentId, semester });
        res.status(201).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/drop', authMiddleware, async (req, res) => {
    try {
        const { courseId, studentId } = req.body;
        await CourseService.drop({ courseId, studentId });
        res.status(200).send();
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/completed', authMiddleware, async (req, res) => {
    try {
        const { studentId } = req.query;
        const courses = await CourseService.getCompleted(studentId);
        res.json(courses);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/check-conflict', authMiddleware, async (req, res) => {
    try {
        const { courseId, studentId } = req.body;
        const result = await CourseService.checkConflict(courseId, studentId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router; 