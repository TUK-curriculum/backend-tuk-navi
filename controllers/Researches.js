// controllers/Researches.js
'use strict';

const express = require('express');
const router = express.Router();
const researchesService = require('../service/ResearchesService');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * [GET] /researches
 * 연구 업적 전체 조회
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const researches = await researchesService.getResearches(req.user.userId);

    res.status(200).json({
      success: true,
      message: '연구 업적 조회 성공',
      data: researches
    });
  } catch (error) {
    console.error('[GET /researches] 연구 업적 조회 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 연구 업적을 조회할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * [POST] /researches
 * 연구 업적 추가
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, publishedAt, type } = req.body;

    if (!title || !publishedAt || !type) {
      return res.status(400).json({
        success: false,
        message: 'title, publishedAt, type는 모두 입력해야 합니다.',
        data: null
      });
    }

    const newResearch = await researchesService.addResearch(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: '연구 업적이 등록되었습니다.',
      data: newResearch
    });
  } catch (error) {
    console.error('[POST /researches] 연구 업적 등록 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 연구 업적을 등록할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * [PUT] /researches/:researchId
 * 연구 업적 수정
 */
router.put('/:researchId', authMiddleware, async (req, res) => {
  try {
    const { researchId } = req.params;

    if (!researchId) {
      return res.status(400).json({
        success: false,
        message: 'researchId가 필요합니다.',
        data: null
      });
    }

    const updated = await researchesService.updateResearch(req.user.userId, researchId, req.body);

    res.status(200).json({
      success: true,
      message: updated.message,
      data: updated.research
    });
  } catch (error) {
    console.error('[PUT /researches/:researchId] 연구 업적 수정 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 연구 업적을 수정할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * [DELETE] /researches/:researchId
 * 연구 업적 삭제
 */
router.delete('/:researchId', authMiddleware, async (req, res) => {
  try {
    const { researchId } = req.params;

    if (!researchId) {
      return res.status(400).json({
        success: false,
        message: 'researchId가 필요합니다.',
        data: null
      });
    }

    const result = await researchesService.deleteResearch(req.user.userId, researchId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('[DELETE /researches/:researchId] 연구 업적 삭제 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 연구 업적을 삭제할 수 없습니다.',
      error: error.message
    });
  }
});

module.exports = router;
