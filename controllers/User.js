const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const UserService = require('../service/UserService');

/**
 * [GET] /users
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json({ success: true, message: '사용자 목록 조회 성공', data: users });
  } catch (error) {
    console.error('[GET /users] 에러:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * [GET] /users/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * [PUT] /users/:id
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { user, profile } = await UserService.updateUser(req.params.id, req.body);
    res.json({ success: true, message: '사용자 정보 수정 성공', data: { user, profile } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * [DELETE] /users/:id
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await UserService.deleteUser(req.params.id);
    res.json({ success: true, message: '사용자 삭제 성공' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;