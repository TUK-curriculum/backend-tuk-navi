// controllers/Main.js
'use strict';

const express = require('express');
const router = express.Router();
const mainService = require('../service/MainService');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * ✅ [GET] /main/curriculums/default
 * 기본 커리큘럼 조회
 */
router.get('/curriculums/default', authMiddleware, async (req, res) => {
  try {
    const data = await mainService.getDefaultCurriculum(req.user.userId);

    res.status(200).json({
      success: true,
      message: '기본 커리큘럼 조회 성공',
      data
    });
  } catch (error) {
    console.error('🚨 [GET /curriculums/default] 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 기본 커리큘럼을 조회할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * ✅ [GET] /main/users/records/credits
 * 내 수강 기록 총 학점 조회
 */
router.get('/users/records/credits', authMiddleware, async (req, res) => {
  try {
    const data = await mainService.getRecordsCredits(req.user.userId);

    res.status(200).json({
      success: true,
      message: '수강 기록 학점 조회 성공',
      data
    });
  } catch (error) {
    console.error('🚨 [GET /users/records/credits] 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 수강 기록을 조회할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * ✅ [GET] /main/graduation/pass
 * 졸업 학점 통과 여부 조회
 */
router.get('/graduation/pass', authMiddleware, async (req, res) => {
  try {
    const data = await mainService.getGraduationPass(req.user.userId);

    res.status(200).json({
      success: true,
      message: '졸업 학점 통과 여부 조회 성공',
      data
    });
  } catch (error) {
    console.error('🚨 [GET /graduation/pass] 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 졸업 학점 통과 여부를 조회할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * ✅ [GET] /main/graduation/required-missing
 * 미이수 필수 과목 조회
 */
router.get('/graduation/required-missing', authMiddleware, async (req, res) => {
  try {
    const data = await mainService.getRequiredMissing(req.user.userId);

    res.status(200).json({
      success: true,
      message: '미이수 필수과목 조회 성공',
      data
    });
  } catch (error) {
    console.error('🚨 [GET /graduation/required-missing] 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 미이수 필수과목을 조회할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * ✅ [GET] /main/graduation/core
 * 핵심 교양 이수 여부 조회
 */
router.get('/graduation/core', authMiddleware, async (req, res) => {
  try {
    const data = await mainService.getCoreCompletion(req.user.userId);

    res.status(200).json({
      success: true,
      message: '핵심 교양 이수 여부 조회 성공',
      data
    });
  } catch (error) {
    console.error('🚨 [GET /graduation/core] 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 핵심 교양 이수 여부를 조회할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * ✅ [GET] /main/users/timetable/current
 * 현재 시간표 조회
 */
router.get('/users/timetable/current', authMiddleware, async (req, res) => {
  try {
    const data = await mainService.getCurrentTimetable(req.user.userId);

    res.status(200).json({
      success: true,
      message: '현재 시간표 조회 성공',
      data
    });
  } catch (error) {
    console.error('🚨 [GET /users/timetable/current] 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 시간표를 조회할 수 없습니다.',
      error: error.message
    });
  }
});

module.exports = router;
