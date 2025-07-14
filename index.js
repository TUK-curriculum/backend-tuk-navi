// index.js

require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
require('./service/googleStrategy');
const PORT = process.env.PORT || 3000;

/* 기본 설정 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ✅ 세션 및 passport 초기화 */
app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

/* Swagger */
const { swaggerUi, swaggerDocument } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* 인증 미들웨어 */
const authMiddleware = require('./middlewares/authMiddleware');

/* 라우터 설정 */
const authController         = require('./controllers/Auth');
const mainController         = require('./controllers/Main');
const certificateController  = require('./controllers/Certificate');
const chatbotController      = require('./controllers/Chatbot');
const curriculumsController  = require('./controllers/Curriculums');
const graduationController   = require('./controllers/Graduation');
const lecturesController     = require('./controllers/Lectures');
const profileController      = require('./controllers/Profile');
const recordsController      = require('./controllers/Records');
const researchesController   = require('./controllers/Researches');
const reviewsController      = require('./controllers/Reviews');

const syllabusRoutes = require('./api/syllabus');

// ✅ 수정된 부분: 경로 './routes/lectures' → './api/lectures'
const lecturesRoutes = require('./api/lectures');     // ✅ 수정 완료

app.use('/api/lectures', lecturesRoutes);             // ✅ 그대로 유지
app.use('/api', syllabusRoutes);
app.use('/main',        authMiddleware, mainController);
app.use('/certificate', authMiddleware, certificateController);
app.use('/chatbot',     authMiddleware, chatbotController);
app.use('/curriculums', authMiddleware, curriculumsController);
app.use('/graduation',  authMiddleware, graduationController);
app.use('/lectures',    authMiddleware, lecturesController);
app.use('/profile',     authMiddleware, profileController);
app.use('/records',     authMiddleware, recordsController);
app.use('/researches',  authMiddleware, researchesController);
app.use('/reviews',     authMiddleware, reviewsController);

/* 인증이 필요 없는 경로 */
app.use('/auth', authController);

/* DB 연결 */
const db = require('./models');
const { sequelize, RequiredCourse } = db;
RequiredCourse.sync();

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📄 Swagger Docs available at: http://localhost:${PORT}/api-docs`);
  });
}).catch((error) => {
  console.error('Unable to connect to the database:', error);
});
