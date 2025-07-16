const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { User, EmailVerification, RefreshToken } = require('../models');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const ACCESS_TOKEN_EXPIRATION = '1h';
const REFRESH_TOKEN_EXPIRATION = '7d';

async function signup(email, password, username, major, phone, studentId, grade, interests) {
  console.log(`🔍 [authService] signup called with params:`, { email, username, major, phone, studentId, grade, gradeType: typeof grade });

  if (await User.findOne({ where: { email } })) {
    throw new Error('이미 존재하는 이메일입니다.');
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const u = await User.create({ email, password_hash: hashed, major, phone, provider: 'local' });

  // UserProfile 레코드도 함께 생성 (student_id, grade 포함)
  const { UserProfile } = require('../models');
  const gradeValue = Number(grade) || 1;  // 명시적으로 숫자 변환
  console.log(`🔍 [authService] Creating UserProfile with grade: ${gradeValue} (type: ${typeof gradeValue})`);

  try {
    await UserProfile.create({
      user_id: u.id,
      name: username,
      student_id: studentId || '',  // student_id 필드 추가
      major: major,
      phone: phone,
      grade: gradeValue,  // 변환된 grade 값 사용
      semester: 1,
      interests: interests ? JSON.stringify(interests) : null  // interests를 JSON 문자열로 저장
    });
  } catch (err) {
    // Sequelize validation errors 처리
    if (err.name === 'SequelizeValidationError') {
      throw new Error('회원 프로필 정보가 유효하지 않습니다.');
    }
    // 기타 오류 원상 복구
    throw err;
  }

  console.log(`✅ UserProfile created for user ${u.id} with student_id: ${studentId}, grade: ${gradeValue}`);

  return { userId: u.id, email: u.email, username: username, major: u.major, phone: u.phone, studentId: studentId, grade: gradeValue, createdAt: u.createdAt };
}

async function findOrCreateUser(email, username, provider) {
  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await User.create({
      email,
      username,
      password: null,
      provider
    });
  }
  return user;
}

async function signupKakao(token) {
  if (!token) throw new Error('카카오 액세스 토큰이 필요합니다.');
  const res = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  if (!res.ok) throw new Error('카카오 API 요청 실패');
  const info = await res.json();
  const email = info.kakao_account?.email || `kakao_${info.id}@example.com`;
  const name = info.properties?.nickname || '카카오사용자';
  const user = await findOrCreateUser(email, name, 'kakao');
  return { userId: user.id, email: user.email, username: user.username, provider: user.provider, createdAt: user.createdAt };
}

async function signupGoogle(token) {
  if (!token) throw new Error('구글 액세스 토큰이 필요합니다.');
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('구글 API 요청 실패');
  const info = await res.json();
  const email = info.email || (() => { throw new Error('이메일 정보가 없습니다.'); })();
  const name = info.name || '구글사용자';
  const user = await findOrCreateUser(email, name, 'google');
  return { userId: user.id, email: user.email, username: user.username, provider: user.provider, createdAt: user.createdAt };
}

function generateTokens(userId) {
  const access = jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
  const refresh = jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
  return { accessToken: access, refreshToken: refresh };
}

async function login(email, password) {
  const { UserProfile } = require('../models');

  const user = await User.findOne({
    where: { email },
    include: [{
      model: UserProfile,
      required: false,
      attributes: ['name', 'student_id', 'major', 'grade', 'semester', 'phone']
    }]
  });

  if (!user) throw new Error('사용자를 찾을 수 없습니다.');
  if (!user.password_hash) throw new Error('소셜 계정은 비밀번호 로그인 불가');
  if (!await bcrypt.compare(password, user.password_hash)) throw new Error('비밀번호가 일치하지 않습니다.');
  const tokens = generateTokens(user.id);

  // 추가: user.id, tokens.refreshToken 값 로그
  console.log('[LOGIN] user.id:', user.id);
  console.log('[LOGIN] tokens.refreshToken:', tokens.refreshToken);
  if (!user.id) throw new Error('로그인 오류: user.id가 없습니다. 관리자에게 문의하세요.');
  if (!tokens.refreshToken) throw new Error('로그인 오류: refreshToken 생성 실패. 관리자에게 문의하세요.');

  await RefreshToken.upsert({ token: tokens.refreshToken, userId: user.id });

  // 사용자 정보와 토큰을 함께 반환 (UserProfile 정보 포함)
  return {
    ...tokens,
    user: {
      userId: user.id,
      name: user.UserProfile?.name || user.username,
      nickname: user.UserProfile?.name || user.username,
      email: user.email,
      studentId: user.UserProfile?.student_id || '',
      major: user.UserProfile?.major || user.major,
      grade: user.UserProfile?.grade || 1,
      semester: user.UserProfile?.semester || 1,
      phone: user.UserProfile?.phone || user.phone,
      provider: user.provider,
      createdAt: user.createdAt
    }
  };
}

async function loginKakao(token) {
  const u = await signupKakao(token);
  const tokens = generateTokens(u.userId);
  await RefreshToken.create({ token: tokens.refreshToken, userId: u.userId });
  return tokens;
}

async function loginGoogle(token) {
  const u = await signupGoogle(token);
  const tokens = generateTokens(u.userId);
  await RefreshToken.create({ token: tokens.refreshToken, userId: u.userId });
  return tokens;
}

async function getAccount(userId) {
  const u = await User.findByPk(userId);
  if (!u) throw new Error('유효하지 않은 사용자입니다.');
  return { userId: u.id, email: u.email, username: u.username, major: u.major, phone: u.phone, provider: u.provider, createdAt: u.createdAt, updatedAt: u.updatedAt };
}

async function updateAccount(userId, username, major) {
  const u = await User.findByPk(userId);
  if (!u) throw new Error('유효하지 않은 사용자입니다.');
  if (username?.trim()) u.username = username;
  if (major?.trim()) u.major = major;
  await u.save();
  return { userId: u.id, username: u.username, major: u.major, updatedAt: u.updatedAt };
}

async function deleteAccount(userId) {
  const u = await User.findByPk(userId);
  if (!u) throw new Error('유효하지 않은 사용자입니다.');
  await RefreshToken.destroy({ where: { userId } });
  await u.destroy();
  return true;
}

async function sendEmailVerification(email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  await EmailVerification.upsert({ email, code, expiresAt: expires });
  console.log(`이메일 ${email}로 인증코드 ${code} 발송`);
  return true;
}

async function confirmEmailCode(email, code) {
  const rec = await EmailVerification.findOne({ where: { email } });
  if (!rec || new Date() > rec.expiresAt || rec.code !== code) {
    if (rec) await EmailVerification.destroy({ where: { email } });
    return false;
  }
  await EmailVerification.destroy({ where: { email } });
  return true;
}

async function checkEmailDuplication(email) {
  return !!await User.findOne({ where: { email } });
}

async function sendPasswordReset(email) {
  const u = await User.findOne({ where: { email } });
  if (!u) throw new Error('이메일을 찾을 수 없습니다.');
  const token = crypto.randomBytes(20).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await EmailVerification.upsert({ email, code: token, expiresAt: expires });
  console.log(`이메일 ${email}로 비밀번호 재설정 토큰 ${token} 발송`);
  return true;
}

async function verifyPhoneNumber(phone) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`휴대폰 ${phone}으로 인증코드 ${code} 발송`);
  return true;
}

async function issueToken(refresh_token) {
  const rec = await RefreshToken.findOne({ where: { token: refresh_token } });
  if (!rec) throw new Error('유효하지 않은 refresh token입니다.');
  const { userId } = jwt.verify(refresh_token, JWT_SECRET);
  await rec.destroy();
  const newTokens = generateTokens(userId);
  await RefreshToken.create({ token: newTokens.refreshToken, userId });
  return newTokens;
}

async function logout(refresh_token) {
  if (!await RefreshToken.findOne({ where: { token: refresh_token } })) {
    throw new Error('유효하지 않은 refresh token입니다.');
  }
  await RefreshToken.destroy({ where: { token: refresh_token } });
  return { message: '로그아웃 완료' };
}

async function recoverIdByPhone(phone) {
  const u = await User.findOne({ where: { phone } });
  if (!u) throw new Error('등록된 번호가 없습니다.');
  return u.email;
}

async function recoverPasswordByEmail(email) {
  return await sendPasswordReset(email);
}

async function registerSocialUser(username, major) {
  const u = await User.create({ email: `social_${Date.now()}@example.com`, username, major, password: null, provider: 'social' });
  return { userId: u.id, username: u.username, major: u.major, createdAt: u.createdAt };
}

module.exports = {
  signup, signupKakao, signupGoogle,
  login, loginKakao, loginGoogle,
  generateTokens, issueToken,
  getAccount, updateAccount, deleteAccount,
  sendEmailVerification, confirmEmailCode, checkEmailDuplication,
  sendPasswordReset, verifyPhoneNumber, logout,
  recoverIdByPhone, recoverPasswordByEmail,
  registerSocialUser,
  findOrCreateUser // ✅ 여기 반드시 포함!
};
