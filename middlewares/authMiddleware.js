const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // ✅ 1. 헤더에서 Authorization 값이 존재하는지 확인
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: '인증이 필요합니다. (Authorization 헤더 없음)' });
    }

    // ✅ 2. Bearer 토큰 형식인지 확인
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ error: '토큰 형식이 잘못되었습니다. (Bearer <token> 형식이어야 함)' });
    }

    const token = tokenParts[1];

    // ✅ 3. JWT 시크릿 키 설정 확인
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      console.error('🚨 JWT_SECRET 환경 변수가 설정되지 않았습니다.');
      return res.status(500).json({ error: '서버 설정 오류 (JWT_SECRET 미설정)' });
    }

    // ✅ 4. JWT 검증
    const decoded = jwt.verify(token, secretKey);
    console.log('✅ Decoded JWT:', decoded);

    // ✅ 5. 필수 데이터 검증
    if (!decoded.userId) {
      return res.status(401).json({ error: '유효하지 않은 사용자입니다. (userId 없음)' });
    }

    // ✅ 6. 인증된 사용자 정보 저장
    req.user = decoded;
    next();  // 다음 미들웨어로 이동

  } catch (err) {
    console.error('❌ JWT 검증 실패:', err.message);

    let errorMessage = '토큰 검증 실패';
    if (err.name === 'TokenExpiredError') {
      errorMessage = '토큰이 만료되었습니다.';
    } else if (err.name === 'JsonWebTokenError') {
      errorMessage = '유효하지 않은 토큰입니다.';
    }

    return res.status(401).json({ error: errorMessage });
  }
};
