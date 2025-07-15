# TUK Navi Backend

TUK Navi 백엔드 API 서버입니다.

## 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# Server Configuration
PORT=3000

# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=tuk_navi

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-northeast-2
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_FOLDER_PREFIX=lectures/
```

### 3. 데이터베이스 설정

MySQL 데이터베이스를 설정하고 `tuk_navi` 데이터베이스를 생성하세요:

```sql
CREATE DATABASE tuk_navi;
```

### 4. 서버 실행

개발 모드:
```bash
npm run dev
```

프로덕션 모드:
```bash
npm start
```

서버가 실행되면 다음 URL에서 접근할 수 있습니다:
- API 서버: http://localhost:3000
- Swagger 문서: http://localhost:3000/api-docs

## API 엔드포인트

### 인증
- `POST /auth/login` - 로그인
- `POST /auth/register` - 회원가입
- `GET /auth/google` - Google OAuth 로그인
- `GET /auth/google/callback` - Google OAuth 콜백

### 강의 관리
- `GET /api/lectures` - 강의 목록 조회
- `POST /api/lectures` - 강의 업로드
- `GET /api/lectures/:id` - 강의 상세 조회

### 프로필
- `GET /profile` - 사용자 프로필 조회
- `PUT /profile` - 프로필 수정

### 기타
- `GET /main` - 메인 페이지
- `GET /curriculums` - 커리큘럼 조회
- `GET /graduation` - 졸업 요건 조회
- `GET /records` - 학적 조회
- `GET /reviews` - 강의 리뷰 조회

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (Sequelize ORM)
- **Authentication**: Passport.js, JWT
- **File Storage**: AWS S3
- **Documentation**: Swagger/OpenAPI
- **Development**: Nodemon

## 프로젝트 구조

```
backend-tuk-navi/
├── api/              # API 라우터
├── config/           # 설정 파일
├── controllers/      # 컨트롤러
├── middlewares/      # 미들웨어
├── models/           # 데이터베이스 모델
├── service/          # 비즈니스 로직
├── utils/            # 유틸리티 함수
├── index.js          # 메인 서버 파일
└── swagger.js        # Swagger 설정
```
