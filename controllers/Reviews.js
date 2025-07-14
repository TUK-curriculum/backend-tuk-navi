// controllers/Reviews.js
'use strict';

const express = require('express');
const router = express.Router();
const reviewsService = require('../service/ReviewsService');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * ✅ [GET] /reviews
 * 리뷰 전체 조회
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const reviews = await reviewsService.getReviews(req.user.userId);

    res.status(200).json({
      success: true,
      message: '리뷰 목록 조회 성공',
      data: reviews
    });
  } catch (error) {
    console.error('🚨 [GET /reviews] 리뷰 조회 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 리뷰를 조회할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * ✅ [POST] /reviews
 * 새 리뷰 등록
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { courseName, content, rating } = req.body;

    // 필수 입력값 검증
    if (!courseName || !content || rating == null) {
      return res.status(400).json({
        success: false,
        message: 'courseName, content, rating 모두 입력해야 합니다.',
        data: null
      });
    }

    const newReview = await reviewsService.addReview(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      message: '리뷰가 성공적으로 등록되었습니다.',
      data: newReview
    });
  } catch (error) {
    console.error('🚨 [POST /reviews] 리뷰 등록 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 리뷰를 등록할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * ✅ [PUT] /reviews/:reviewId
 * 리뷰 수정
 */
router.put('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'reviewId가 필요합니다.',
        data: null
      });
    }

    const updated = await reviewsService.updateReview(req.user.userId, reviewId, req.body);

    res.status(200).json({
      success: true,
      message: updated.message,
      data: updated.review
    });
  } catch (error) {
    console.error('🚨 [PUT /reviews/:reviewId] 리뷰 수정 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 리뷰를 수정할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * ✅ [DELETE] /reviews/:reviewId
 * 리뷰 삭제
 */
router.delete('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'reviewId가 필요합니다.',
        data: null
      });
    }

    const result = await reviewsService.deleteReview(req.user.userId, reviewId);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('🚨 [DELETE /reviews/:reviewId] 리뷰 삭제 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 리뷰를 삭제할 수 없습니다.',
      error: error.message
    });
  }
});

module.exports = router;
