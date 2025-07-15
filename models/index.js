// models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {};

// 모델 불러오기
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.EmailVerification = require('./emailVerification')(sequelize, Sequelize.DataTypes);
db.RefreshToken = require('./refreshToken')(sequelize, Sequelize.DataTypes);
db.Curriculum = require('./curriculum')(sequelize, Sequelize.DataTypes);
db.Lecture = require('./lecture')(sequelize, Sequelize.DataTypes);
db.Records = require('./records')(sequelize, Sequelize.DataTypes);
db.Certificate = require('./certificate')(sequelize, Sequelize.DataTypes);
db.UserCredits = require('./userCredits')(sequelize, Sequelize.DataTypes);
db.Timetable = require('./timetable')(sequelize, Sequelize.DataTypes);
db.RequiredCourse = require('./requiredCourse')(sequelize, Sequelize.DataTypes);
db.RequiredCredit = require('./requiredCredit')(sequelize, Sequelize.DataTypes);
db.Review = require('./Review')(sequelize, Sequelize.DataTypes);

// Register new user-related models

db.UserProfile = require('./userProfile')(sequelize, Sequelize.DataTypes);
db.UserSettings = require('./userSettings')(sequelize, Sequelize.DataTypes);
db.UserStatistics = require('./userStatistics')(sequelize, Sequelize.DataTypes);
db.GraduationInfo = require('./graduationInfo')(sequelize, Sequelize.DataTypes);

// ===== New domain models =====
db.Course = require('./course')(sequelize, Sequelize.DataTypes);
db.CourseSchedule = require('./courseSchedule')(sequelize, Sequelize.DataTypes);
db.Enrollment = require('./enrollment')(sequelize, Sequelize.DataTypes);
db.CompletedCourse = require('./completedCourse')(sequelize, Sequelize.DataTypes);
db.CurriculumSubject = require('./curriculumSubject')(sequelize, Sequelize.DataTypes);
db.Schedule = require('./schedule')(sequelize, Sequelize.DataTypes);
db.TimetableSlot = require('./timetableSlot')(sequelize, Sequelize.DataTypes);
db.CustomEvent = require('./customEvent')(sequelize, Sequelize.DataTypes);
db.Note = require('./note')(sequelize, Sequelize.DataTypes);
db.ChatMessage = require('./chatMessage')(sequelize, Sequelize.DataTypes);
db.Notification = require('./notification')(sequelize, Sequelize.DataTypes);


// 모델 간 관계 설정
db.User.hasOne(db.UserCredits, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Timetable, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Records, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Certificate, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Curriculum, { foreignKey: 'userId', onDelete: 'CASCADE' });

db.Curriculum.hasMany(db.Lecture, { foreignKey: 'curri_id', as: 'lectures', onDelete: 'CASCADE' });
db.Lecture.belongsTo(db.Curriculum, { foreignKey: 'curri_id', as: 'curriculum' });

db.Certificate.belongsTo(db.User, { foreignKey: 'userId' });
db.Records.belongsTo(db.User, { foreignKey: 'userId' });

// Define associations for new models

db.User.hasOne(db.UserProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.User.hasOne(db.UserSettings, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.User.hasOne(db.UserStatistics, { foreignKey: 'user_id', onDelete: 'CASCADE' });
db.User.hasOne(db.GraduationInfo, { foreignKey: 'user_id', onDelete: 'CASCADE' });

db.UserProfile.belongsTo(db.User, { foreignKey: 'user_id' });
db.UserSettings.belongsTo(db.User, { foreignKey: 'user_id' });
db.UserStatistics.belongsTo(db.User, { foreignKey: 'user_id' });
db.GraduationInfo.belongsTo(db.User, { foreignKey: 'user_id' });

// ===== Associations for new models =====
// User relations

db.User.hasMany(db.Enrollment, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.CompletedCourse, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Schedule, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Note, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.ChatMessage, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });

db.Enrollment.belongsTo(db.User, { foreignKey: 'userId' });
db.CompletedCourse.belongsTo(db.User, { foreignKey: 'userId' });
db.Schedule.belongsTo(db.User, { foreignKey: 'userId' });
db.Note.belongsTo(db.User, { foreignKey: 'userId' });
db.ChatMessage.belongsTo(db.User, { foreignKey: 'userId' });
db.Notification.belongsTo(db.User, { foreignKey: 'userId' });

// Course relations

db.Course.hasMany(db.CourseSchedule, { foreignKey: 'courseId', as: 'schedules', onDelete: 'CASCADE' });
db.Course.hasMany(db.Enrollment, { foreignKey: 'courseId', onDelete: 'CASCADE' });
db.Course.hasMany(db.CompletedCourse, { foreignKey: 'courseId', onDelete: 'CASCADE' });

db.CourseSchedule.belongsTo(db.Course, { foreignKey: 'courseId' });
db.Enrollment.belongsTo(db.Course, { foreignKey: 'courseId' });
db.CompletedCourse.belongsTo(db.Course, { foreignKey: 'courseId' });

db.Schedule.hasMany(db.TimetableSlot, { foreignKey: 'scheduleId', as: 'TimetableSlots', onDelete: 'CASCADE' });
db.Schedule.hasMany(db.CustomEvent, { foreignKey: 'scheduleId', as: 'CustomEvents', onDelete: 'CASCADE' });

db.TimetableSlot.belongsTo(db.Schedule, { foreignKey: 'scheduleId', as: 'schedule' });
db.CustomEvent.belongsTo(db.Schedule, { foreignKey: 'scheduleId', as: 'schedule' });

db.TimetableSlot.belongsTo(db.Course, { foreignKey: 'courseId' });

db.Curriculum.hasMany(db.CurriculumSubject, { foreignKey: 'curriculumUserId', onDelete: 'CASCADE' });
db.CurriculumSubject.belongsTo(db.Curriculum, { foreignKey: 'curriculumUserId', targetKey: 'id' });
db.CurriculumSubject.belongsTo(db.Course, { foreignKey: 'courseId' });


// Sequelize 인스턴스 추가
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
