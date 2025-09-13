const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const ProfessorService = require('../service/ProfessorService');

// 교수 목록 조회
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const professors = await ProfessorService.getProfessors(search);
    
    res.json({
      success: true,
      data: professors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 사용자 선호교수 목록 조회
router.get('/preferred', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferredProfessors = await ProfessorService.getUserPreferredProfessors(userId);
    
    res.json({
      success: true,
      data: preferredProfessors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 선호교수 추가
router.post('/preferred', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { professorId } = req.body;

    if (!professorId) {
      return res.status(400).json({
        success: false,
        message: '교수 ID가 필요합니다.'
      });
    }

    const result = await ProfessorService.addPreferredProfessor(userId, professorId);
    
    res.status(201).json({
      success: true,
      data: result,
      message: '선호교수가 추가되었습니다.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 선호교수 삭제
router.delete('/preferred/:preferredId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { preferredId } = req.params;

    const result = await ProfessorService.removePreferredProfessor(userId, preferredId);
    
    res.json({
      success: true,
      data: result,
      message: '선호교수가 삭제되었습니다.'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 특정 교수의 담당 과목 조회
router.get('/:professorId/lectures', async (req, res) => {
  try {
    const { professorId } = req.params;
    const lectures = await ProfessorService.getProfessorLectures(professorId);
    
    res.json({
      success: true,
      data: lectures
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;