const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const CourseService = require('../service/CourseService');

/**
 * 최근 강의 목록 조회
 * GET /courses?major=CE
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { major } = req.query;
    const lectures = await CourseService.listRecentLectures({ major });
    console.log('[DEBUG] /courses result:', lectures.length, lectures);
        
    res.json({ success: true, data: lectures });
  } catch (err) {
    console.error('Error:', err);
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
 * GET /courses/:code/syllabi
 */
router.get('/:code/syllabi', authMiddleware, async (req, res) => {
  try {
    const { semester } = req.query;

    const syllabi = await CourseService.getSyllabiByCourseCode(
      req.params.code,
      Number(semester)
    );

    res.json({ success: true, data: syllabi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;