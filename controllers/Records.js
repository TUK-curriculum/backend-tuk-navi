'use strict';

const express = require('express');
const router = express.Router();
const recordsService = require('../service/RecordsService');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * [POST] /records/direct-input
 * 직접 입력으로 수강내역 추가
 */
router.post('/direct-input', authMiddleware, async (req, res) => {
  try {
    const { courseCode, courseName, credits, grade, semester, type } = req.body;

    if (!courseCode || !courseName || credits == null || !grade || !semester || !type) {
      return res.status(400).json({
        success: false,
        message: 'courseCode, courseName, credits, grade, semester, type 모두 입력해야 합니다.',
        data: null
      });
    }

    const record = await recordsService.createDirectInput({ ...req.body, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: '수강 내역이 성공적으로 입력되었습니다.',
      data: record.record
    });
  } catch (error) {
    console.error('[POST /records/direct-input] 직접입력 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 수강 내역을 입력할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * [POST] /records/capture
 * 캡처 등록으로 수강내역 추가
 */
router.post('/capture', authMiddleware, async (req, res) => {
  try {
    const record = await recordsService.createCaptureRecord({ ...req.body, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: '수강 내역 캡처본이 등록되었습니다.',
      data: record.record
    });
  } catch (error) {
    console.error('[POST /records/capture] 캡처 등록 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 캡처본을 등록할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * [POST] /records/file
 * 파일 등록으로 수강내역 추가
 */
router.post('/file', authMiddleware, async (req, res) => {
  try {
    const record = await recordsService.createFileRecord({ ...req.body, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: '수강 내역 파일이 등록되었습니다.',
      data: record.record
    });
  } catch (error) {
    console.error('[POST /records/file] 파일 등록 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 파일을 등록할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * [GET] /records
 * 내 수강내역 전체 조회
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const records = await recordsService.getRecords(req.user.userId);

    res.status(200).json({
      success: true,
      message: '수강 내역 조회 성공',
      data: records
    });
  } catch (error) {
    console.error('[GET /records] 수강내역 조회 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 수강 내역을 조회할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * [PUT] /records/:recordId
 * 특정 수강내역 수정
 */
router.put('/:recordId', authMiddleware, async (req, res) => {
  try {
    const { recordId } = req.params;
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: 'recordId가 필요합니다.',
        data: null
      });
    }

    const updated = await recordsService.updateRecord(recordId, req.body);

    res.status(200).json({
      success: true,
      message: updated.message,
      data: updated.record
    });
  } catch (error) {
    console.error('[PUT /records/:recordId] 수강내역 수정 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 수강 내역을 수정할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * [DELETE] /records/:recordId
 * 특정 수강내역 삭제
 */
router.delete('/:recordId', authMiddleware, async (req, res) => {
  try {
    const { recordId } = req.params;
    if (!recordId) {
      return res.status(400).json({
        success: false,
        message: 'recordId가 필요합니다.',
        data: null
      });
    }

    const result = await recordsService.deleteRecord(recordId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('[DELETE /records/:recordId] 수강내역 삭제 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 수강 내역을 삭제할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * [POST] /records/reviews
 * 수강 내역 리뷰 등록
 */
router.post('/reviews', authMiddleware, async (req, res) => {
  try {
    const { recordId, content, rating } = req.body;

    if (!recordId || !content || rating == null) {
      return res.status(400).json({
        success: false,
        message: 'recordId, content, rating 모두 입력해야 합니다.',
        data: null
      });
    }

    const newReview = await recordsService.addReview({
      recordId,
      content,
      rating,
      userId: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: '리뷰가 성공적으로 등록되었습니다.',
      data: newReview
    });
  } catch (error) {
    console.error('[POST /records/reviews] 리뷰 등록 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 리뷰를 등록할 수 없습니다.',
      error: error.message
    });
  }
});

module.exports = router;
