// models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {}; 

// 모델 불러오기
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.EmailVerification = require('./emailVerification')(sequelize, Sequelize.DataTypes);
db.RefreshToken = require('./refreshToken')(sequelize, Sequelize.DataTypes);
db.Curriculum = require('./curriculum')(sequelize, Sequelize.DataTypes);
db.LectureCode = require('./lectureCode')(sequelize, Sequelize.DataTypes);
db.Lecture = require('./lecture')(sequelize, Sequelize.DataTypes);
db.LectureHistory = require('./lectureHistory')(sequelize, Sequelize.DataTypes);
db.Records = require('./records')(sequelize, Sequelize.DataTypes);
db.Certificate = require('./certificate')(sequelize, Sequelize.DataTypes);
db.UserCredits = require('./userCredits')(sequelize, Sequelize.DataTypes);
db.Timetable = require('./timetable')(sequelize, Sequelize.DataTypes);
db.RequiredCourse = require('./requiredCourse')(sequelize, Sequelize.DataTypes);
db.RequiredCredit = require('./requiredCredit')(sequelize, Sequelize.DataTypes);
db.Review = require('./Review')(sequelize, Sequelize.DataTypes);
db.Opinion = require('./opinion')(sequelize, Sequelize.DataTypes);

// Register new user-related models

db.UserProfile = require('./userProfile')(sequelize, Sequelize.DataTypes);
db.UserSettings = require('./userSettings')(sequelize, Sequelize.DataTypes);
db.UserStatistics = require('./userStatistics')(sequelize, Sequelize.DataTypes);
db.GraduationInfo = require('./graduationInfo')(sequelize, Sequelize.DataTypes);

db.Course = require('./course')(sequelize, Sequelize.DataTypes);
db.CourseSchedule = require('./courseSchedule')(sequelize, Sequelize.DataTypes);
db.Enrollment = require('./enrollment')(sequelize, Sequelize.DataTypes);
db.CompletedCourse = require('./completedCourse')(sequelize, Sequelize.DataTypes);
db.CurriculumLecture = require('./curriculumLecture')(sequelize, Sequelize.DataTypes);
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

db.Curriculum.belongsTo(db.User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
db.Lecture.belongsTo(db.Curriculum, { foreignKey: 'curri_id', as: 'curriculum' });
db.Lecture.belongsTo(db.LectureCode, { foreignKey: 'code_id', onDelete: 'CASCADE' });
db.LectureCode.hasMany(db.Lecture, { foreignKey: 'code_id', onDelete: 'CASCADE' });
db.LectureHistory.belongsTo(db.Lecture, { foreignKey: 'lect_id', onDelete: 'CASCADE' });
db.Lecture.hasMany(db.LectureHistory, { foreignKey: 'lect_id', onDelete: 'CASCADE' });

db.LectureHistory.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.LectureHistory, { foreignKey: 'userId', onDelete: 'CASCADE' });

db.Certificate.belongsTo(db.User, { foreignKey: 'userId' });
db.Records.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

db.User.hasOne(db.UserProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasOne(db.UserSettings, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasOne(db.UserStatistics, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasOne(db.GraduationInfo, { foreignKey: 'userId', onDelete: 'CASCADE' });

db.UserProfile.belongsTo(db.User, { foreignKey: 'userId' });
db.UserSettings.belongsTo(db.User, { foreignKey: 'userId' });
db.UserStatistics.belongsTo(db.User, { foreignKey: 'userId' });
db.GraduationInfo.belongsTo(db.User, { foreignKey: 'userId' });

db.UserCredits.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.Enrollment, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.CompletedCourse, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Schedule, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Note, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.ChatMessage, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });

db.Enrollment.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.CompletedCourse.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Schedule.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Note.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.ChatMessage.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.Notification.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });


db.Course.hasMany(db.CourseSchedule, { foreignKey: 'courseId', as: 'schedules', onDelete: 'CASCADE' });
db.Course.hasMany(db.Enrollment, { foreignKey: 'courseId', onDelete: 'CASCADE' });
db.Course.hasMany(db.CompletedCourse, { foreignKey: 'courseId', onDelete: 'CASCADE' });
db.Course.hasMany(db.TimetableSlot, { foreignKey: 'courseId', onDelete: 'SET NULL' });

db.CourseSchedule.belongsTo(db.Course, { foreignKey: 'courseId', onDelete: 'CASCADE' });
db.Enrollment.belongsTo(db.Course, { foreignKey: 'courseId', onDelete: 'CASCADE' });
db.CompletedCourse.belongsTo(db.Course, { foreignKey: 'courseId', onDelete: 'CASCADE' });

db.Schedule.hasMany(db.TimetableSlot, { foreignKey: 'scheduleId', as: 'TimetableSlots', onDelete: 'CASCADE' });
db.Schedule.hasMany(db.CustomEvent, { foreignKey: 'scheduleId', as: 'CustomEvents', onDelete: 'CASCADE' });

db.TimetableSlot.belongsTo(db.Schedule, { foreignKey: 'scheduleId', as: 'schedule', onDelete: 'CASCADE' });
db.CustomEvent.belongsTo(db.Schedule, { foreignKey: 'scheduleId', as: 'schedule', onDelete: 'CASCADE' });

db.TimetableSlot.belongsTo(db.Course, { foreignKey: 'courseId', onDelete: 'SET NULL' });

db.Curriculum.hasMany(db.CurriculumLecture, { foreignKey: 'curri_id', as: 'lectures', onDelete: 'CASCADE' });
db.CurriculumLecture.belongsTo(db.Curriculum, { foreignKey: 'curri_id', as: 'curriculum' });

db.LectureCode.hasMany(db.CurriculumLecture, { foreignKey: 'lect_id', as: 'curriculumLectures', onDelete: 'CASCADE' });
db.CurriculumLecture.belongsTo(db.LectureCode, { foreignKey: 'lect_id', as: 'lectureCode' });

db.Opinion.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.Opinion.belongsTo(db.Curriculum, { foreignKey: 'curri_id', as: 'curriculum' });

db.Review.belongsTo(db.Records, { foreignKey: 'recordId', onDelete: 'CASCADE' });
db.Review.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'CASCADE' });

db.Timetable.belongsTo(db.User, { foreignKey: 'userId' });

  
// Sequelize 인스턴스 추가
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});