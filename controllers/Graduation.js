// controllers/Graduation.js
'use strict';

const express = require('express');
const router = express.Router();
const graduationService = require('../service/GraduationService');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * [GET] /graduation/status
 * 졸업 종합 상태 조회 (학점, 필수과목, 자격증, 실습 등)
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const status = await graduationService.getStatusOverview(req.user.userId);
    res.status(200).json({ success: true, status });
  } catch (error) {
    console.error('졸업 종합 상태 조회 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [GET] /graduation/pass
 * 학점 기준 졸업 통과 여부 조회
 */
router.get('/pass', authMiddleware, async (req, res) => {
  try {
    const passStatus = await graduationService.getGraduationPass(req.user.userId);
    res.status(200).json({ success: true, passStatus });
  } catch (error) {
    console.error('졸업 학점 통과 여부 조회 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [GET] /graduation/required
 * 미이수 필수 과목 목록 조회
 */
router.get('/required', authMiddleware, async (req, res) => {
  try {
    const missing = await graduationService.getRequiredMissing(req.user.userId);
    res.status(200).json({ success: true, missingCourses: missing });
  } catch (error) {
    console.error('졸업 필수 과목 미이수 조회 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [GET] /graduation/disqualifications
 * 졸업 결격 사유 조회 (어학, 필수과목, 실습 미이수 등)
 */
router.get('/disqualifications', authMiddleware, async (req, res) => {
  try {
    const disqualifications = await graduationService.getDisqualifications(req.user.userId);
    res.status(200).json({ success: true, disqualifications });
  } catch (error) {
    console.error('졸업 결격 사유 조회 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [GET] /graduation/core
 * 핵심 교양 이수 여부 조회
 */
router.get('/core', authMiddleware, async (req, res) => {
  try {
    const coreStatus = await graduationService.getCoreCompletion(req.user.userId);
    res.status(200).json({ success: true, coreStatus });
  } catch (error) {
    console.error('핵심 교양 이수 여부 조회 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * [GET] /graduation/requirements
 */
router.get('/requirements', authMiddleware, async (req, res) => {
  try {
    const missing = await graduationService.getRequiredMissing(req.user.userId);
    res.status(200).json(missing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * [GET] /graduation/progress
 */
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const pass = await graduationService.getGraduationPass(req.user.userId);
    res.status(200).json(pass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * [GET] /graduation/audit
 */
router.get('/audit', authMiddleware, async (req, res) => {
  try {
    const overview = await graduationService.getStatusOverview(req.user.userId);
    res.status(200).json(overview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
