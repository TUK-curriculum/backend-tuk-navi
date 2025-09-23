const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const GraduationRequirementService = require('../service/GraduationRequirementService');

// GET /graduation-requirements
router.get('/', authMiddleware, async (req, res) => {
    try {
        const requirements = await GraduationRequirementService.getAllRequirements();
        res.json({ success: true, data: requirements });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// POST /graduation-requirements
router.post('/', authMiddleware, async (req, res) => {
    try {
        const requirement = await GraduationRequirementService.createRequirement(req.body);
        res.status(201).json({ success: true, data: requirement });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// PATCH /graduation-requirements/:id
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const updated = await GraduationRequirementService.updateRequirement(req.params.id, req.body);
        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE /graduation-requirements/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await GraduationRequirementService.deleteRequirement(req.params.id);
        res.status(204).json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;