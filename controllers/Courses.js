const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const CourseService = require('../service/CourseService');

/**
 * 최근 강의 목록 조회
 * GET /courses?semester=2025-1&major=CE
 */
router.get('/', async (req, res) => {  // authMiddleware 제거
  try {
    const { semester, major } = req.query;
    console.log('Query params:', { semester, major }); // 디버깅용
    
    const lectures = await CourseService.listRecentLectures({ semester, major });
    console.log('Found lectures:', lectures.length); // 디버깅용
    
    res.json({ success: true, data: lectures });
  } catch (err) {
    console.error('Error:', err); // 디버깅용
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 특정 강의 기본 정보 조회
 * GET /courses/:code
 */
router.get('/:code', authMiddleware, async (req, res) => {
  try {
    const lecture = await CourseService.getRecentLecture(req.params.code);
    if (!lecture) return res.status(404).json({ success: false, message: '강의 없음' });
    res.json({ success: true, data: lecture });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 특정 강의 S3 강의계획서 조회
 * GET /courses/:code/syllabi?semester=2025-1
 */
router.get('/:code/syllabi', authMiddleware, async (req, res) => {
  try {
    const { semester } = req.query;
    const syllabi = await CourseService.getSyllabiByCourseCode(semester, req.params.code);
    res.json({ success: true, data: syllabi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;