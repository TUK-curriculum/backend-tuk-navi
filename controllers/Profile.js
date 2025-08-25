// controllers/Profile.js
'use strict';

const express = require('express');
const router = express.Router();
const profileService = require('../service/ProfileService');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * [GET] /profile
 * 내 프로필 기본 정보 조회
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.user.userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: '사용자 프로필 조회 성공',
      data: profile
    });
  } catch (error) {
    console.error('[GET /profile] 프로필 조회 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 프로필을 조회할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * [PUT] /profile
 * 내 프로필 수정 (부분 수정 가능)
 */
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { username, phone, major } = req.body;

    // 수정할 필드 하나라도 없으면 에러
    if (!username && !phone && !major) {
      return res.status(400).json({
        success: false,
        message: '수정할 항목(username, phone, major) 중 하나 이상이 필요합니다.',
        data: null
      });
    }

    const updatedResult = await profileService.updateProfile(req.user.userId, { username, phone, major });

    res.status(200).json({
      success: true,
      message: '프로필이 성공적으로 수정되었습니다.',
      data: updatedResult.user,
      meta: {
        updatedFields: Object.keys(req.body)
      }
    });
  } catch (error) {
    console.error('[PUT /profile] 프로필 수정 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 프로필을 수정할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * [GET] /profile/summary
 * 내 총 이수 학점 및 평균 평점 조회
 */
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const summary = await profileService.getCreditSummary(req.user.userId);

    res.status(200).json({
      success: true,
      message: '학점 요약 조회 성공',
      data: summary
    });
  } catch (error) {
    console.error('[GET /profile/summary] 학점 요약 조회 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 학점 요약을 조회할 수 없습니다.',
      error: error.message
    });
  }
});

/**
 * [POST] /profile/complete-onboarding
 * 온보딩 완료 처리
 */
router.post('/complete-onboarding', authMiddleware, async (req, res) => {
  try {
    const onboardingData = req.body;
    const result = await profileService.completeOnboarding(req.user.userId, onboardingData);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('[POST /profile/complete-onboarding] 온보딩 완료 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 온보딩 완료 처리에 실패했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
