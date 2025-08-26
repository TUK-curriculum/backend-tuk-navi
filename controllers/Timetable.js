const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const TimetableService = require('../service/TimetableService');

// GET /timetable/current
router.get('/current', authMiddleware, async (req, res) => {
    try {
        const data = await TimetableService.getCurrent(req.user.userId);
        res.json({ success: true, data: data || null });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// POST /timetable/save
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const saved = await TimetableService.save(req.user.userId, req.body);
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// GET /timetable/history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const list = await TimetableService.getHistory(req.user.userId);
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// GET /timetable/semesters  
router.get('/semesters', authMiddleware, async (req, res) => {
  try {
    const { UserProfile } = require('../models');
    const profile = await UserProfile.findOne({
      where: { userId: req.user.userId },
      attributes: ['enrollment_year', 'graduation_year'],
      raw: true,
    });

    if (!profile || !profile.enrollment_year) {
      return res.status(400).json({ success: false, message: '입학년도(enrollment_year)가 필요합니다.' });
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const month = now.getMonth() + 1;

    const currentSem = (month >= 1 && month <= 6) ? 1 : 2;

    const startYear = Number(profile.enrollment_year);
    const endYear = Math.min(Number(profile.graduation_year || currentYear), currentYear);

    if (startYear > endYear) {
      return res.json({ success: true, data: [] });
    }

    const semesters = [];
    for (let y = startYear; y <= endYear; y++) {
      const maxSem = (y === currentYear) ? currentSem : 2;
      for (let s = 1; s <= maxSem; s++) {
        semesters.push(`${y}-${s}학기`);
      }
    }

    res.json({
      success: true,
      data: semesters,
      meta: { startYear, endYear, currentSem }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router; 