// controllers/Auth.js
const express = require('express');
const router = express.Router();
const authService = require('../service/authService');
const authMiddleware = require('../middlewares/authMiddleware');
const passport = require('passport');

/**
 * [     POST] /auth/signup
 * 일반 회원가입
 */
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request body:', JSON.stringify(req.body, null, 2));
    const { email, password, username, major, phone, studentId, grade, interests } = req.body;
    console.log('Extracted fields:', { email, password: password ? '[HIDDEN]' : undefined, username, major, phone, studentId, grade, interests });
    const user = await authService.signup(email, password, username, major, phone, studentId, grade, interests);
    console.log('Signup successful for user:', { userId: user.userId, email: user.email, studentId: user.studentId, grade: user.grade });
    res.status(201).json({ message: '회원가입 완료', user });
  } catch (error) {
    console.error('Signup error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(400).json({ error: error.message });
  }
});

/**
 * [POST] /auth/signup/kakao
 */
router.post('/signup/kakao', async (req, res) => {
  try {
    const { token, email, username } = req.body;
    if (!token) return res.status(400).json({ error: '카카오 액세스 토큰이 필요합니다.' });
    const user = await authService.signupKakao(token, email, username);
    res.status(201).json({ message: '카카오 회원가입 완료', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// controllers/Auth.js
// 구글 로그인
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  accessType: 'offline',
  prompt: 'consent'
}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Google 로그인 성공',
      user: req.user
    });
  }
);



/**
 * [POST] /auth/login
 * 이메일/비밀번호 로그인
 */
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', JSON.stringify(req.body, null, 2));
    const { email, password } = req.body;
    console.log('Login fields:', { email, password: password ? '[HIDDEN]' : undefined });
    const tokens = await authService.login(email, password);
    console.log('Login successful, tokens generated');
    res.status(200).json(tokens);
  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Login error stack:', error.stack);
    res.status(401).json({ error: error.message });
  }
});

/**
 * [POST] /auth/login/kakao
 */
router.post('/login/kakao', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: '카카오 액세스 토큰이 필요합니다.' });
    const tokens = await authService.loginKakao(token);
    res.status(200).json(tokens);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * [POST] /auth/login/google
 */
router.post('/login/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: '구글 액세스 토큰이 필요합니다.' });
    const tokens = await authService.loginGoogle(token);
    res.status(200).json(tokens);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * [GET] /auth/account
 */
router.get('/account', authMiddleware, async (req, res) => {
  try {
    const userInfo = await authService.getAccount(req.user.userId);
    res.status(200).json(userInfo);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * [PUT] /auth/account
 */
router.put('/account', authMiddleware, async (req, res) => {
  try {
    const updated = await authService.updateAccount(req.user.userId, req.body.username, req.body.major);
    res.status(200).json({ message: '회원 정보 수정 성공', user: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * [DELETE] /auth/account
 */
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    await authService.deleteAccount(req.user.userId);
    res.status(200).json({ message: '회원 탈퇴 성공' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * [POST] /auth/email-verification
 */
router.post('/email-verification', async (req, res) => {
  try {
    await authService.sendEmailVerification(req.body.email);
    res.status(200).json({ message: '인증 메일 전송 성공' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * [GET] /auth/email-duplication
 */
router.get('/email-duplication', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: '이메일을 입력하세요.' });
    const duplicated = await authService.checkEmailDuplication(email);
    res.status(200).json({ duplicated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * [POST] /auth/email-confirmation
 */
router.post('/email-confirmation', async (req, res) => {
  try {
    const success = await authService.confirmEmailCode(req.body.email, req.body.code);
    if (success) res.status(200).json({ message: '이메일 인증 완료' });
    else res.status(400).json({ error: '인증 코드가 일치하지 않습니다.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * [POST] /auth/password-reset
 */
router.post('/password-reset', async (req, res) => {
  try {
    await authService.sendPasswordReset(req.body.email);
    res.status(200).json({ message: '비밀번호 초기화 메일 전송 성공' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * [POST] /auth/phone-verification
 */
router.post('/phone-verification', async (req, res) => {
  try {
    await authService.verifyPhoneNumber(req.body.phone);
    res.status(200).json({ message: '휴대폰 인증 성공' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * [POST] /auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const user = await authService.registerSocialUser(req.body.username, req.body.major);
    res.status(201).json({ message: '회원 등록 완료', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * [POST] /auth/token
 */
router.post('/token', async (req, res) => {
  try {
    const newTokens = await authService.issueToken(req.body.refresh_token);
    res.status(200).json(newTokens);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * [DELETE] /auth/session
 */
router.delete('/session', async (req, res) => {
  try {
    await authService.logout(req.body.refresh_token);
    res.status(200).json({ message: '로그아웃 성공' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;