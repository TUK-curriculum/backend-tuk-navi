// controllers/Curriculums.js
'use strict';

const express = require('express');
const router = express.Router();
const curriculumsService = require('../service/CurriculumsService');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * [GET] /curriculums
 * 내 커리큘럼 전체 조회
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const curriculums = await curriculumsService.getCurriculums(req.user.userId);
    res.status(200).json({ success: true, curriculums });
  } catch (error) {
    console.error('커리큘럼 전체 조회 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [GET] /curriculums/:curriId
 * 특정 커리큘럼 상세 조회
 */
router.get('/:curriId', authMiddleware, async (req, res) => {
  try {
    const { curriId } = req.params;
    if (!curriId) {
      return res.status(400).json({ success: false, message: 'curriId가 필요합니다.' });
    }

    const curriculum = await curriculumsService.getCurriculumById(req.user.userId, curriId);
    res.status(200).json({ success: true, curriculum });
  } catch (error) {
    console.error('커리큘럼 상세 조회 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [POST] /curriculums
 * 새 커리큘럼 생성
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: '커리큘럼 이름(name)이 필요합니다.' });
    }

    const newCurriculum = await curriculumsService.createCurriculum(req.user.userId, req.body);
    res.status(201).json({ success: true, curriculum: newCurriculum });
  } catch (error) {
    console.error('커리큘럼 생성 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [DELETE] /curriculums/:curriId
 * 커리큘럼 삭제
 */
router.delete('/:curriId', authMiddleware, async (req, res) => {
  try {
    const { curriId } = req.params;
    if (!curriId) {
      return res.status(400).json({ success: false, message: 'curriId가 필요합니다.' });
    }

    const result = await curriculumsService.deleteCurriculum(req.user.userId, curriId);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('커리큘럼 삭제 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [POST] /curriculums/:curriId/lectures
 * 커리큘럼에 과목 추가
 */
router.post('/:curriId/lectures', authMiddleware, async (req, res) => {
  try {
    const { curriId } = req.params;
    if (!curriId) {
      return res.status(400).json({ success: false, message: 'curriId가 필요합니다.' });
    }

    const lecture = await curriculumsService.addLecture(curriId, req.body);
    res.status(201).json({ success: true, lecture });
  } catch (error) {
    console.error('커리큘럼 과목 추가 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [PUT] /curriculums/:curriId/lectures/:lectId
 * 커리큘럼 안 과목 수정
 */
router.put('/:curriId/lectures/:lectId', authMiddleware, async (req, res) => {
  try {
    const { curriId, lectId } = req.params;
    if (!curriId || !lectId) {
      return res.status(400).json({ success: false, message: 'curriId와 lectId가 필요합니다.' });
    }

    const updated = await curriculumsService.updateLectureOrder(curriId, lectId, req.body);
    res.status(200).json({ success: true, updatedLecture: updated });
  } catch (error) {
    console.error('커리큘럼 과목 수정 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [DELETE] /curriculums/:curriId/lectures/:lectId
 * 커리큘럼 안 과목 삭제
 */
router.delete('/:curriId/lectures/:lectId', authMiddleware, async (req, res) => {
  try {
    const { curriId, lectId } = req.params;
    if (!curriId || !lectId) {
      return res.status(400).json({ success: false, message: 'curriId와 lectId가 필요합니다.' });
    }

    const result = await curriculumsService.deleteLecture(curriId, lectId);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('커리큘럼 과목 삭제 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [POST] /curriculums/default
 * 기본 커리큘럼 설정
 */
router.post('/default', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: '기본 커리큘럼 이름(name)이 필요합니다.' });
    }

    const result = await curriculumsService.setDefaultCurriculum(req.user.userId, req.body);
    res.status(201).json({ success: true, message: result.message, curriculum: result.curriculum });
  } catch (error) {
    console.error('기본 커리큘럼 설정 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [GET] /curriculums/default
 * 기본 커리큘럼 조회
 */
router.get('/default', authMiddleware, async (req, res) => {
  try {
    const defaultCurriculum = await curriculumsService.getDefaultCurriculum(req.user.userId);
    res.status(200).json({ success: true, defaultCurriculum });
  } catch (error) {
    console.error('기본 커리큘럼 조회 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [POST] /curriculums/:curriId/opinions
 * 커리큘럼 의견 등록
 */
router.post('/:curriId/opinions', authMiddleware, async (req, res) => {
  try {
    const { curriId } = req.params;
    if (!curriId) {
      return res.status(400).json({ success: false, message: 'curriId가 필요합니다.' });
    }

    const opinion = await curriculumsService.addOpinion(curriId, req.body);
    res.status(201).json({ success: true, opinion });
  } catch (error) {
    console.error('커리큘럼 의견 등록 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
