// models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {};

// 모델 불러오기
db.User              = require('./user')(sequelize, Sequelize.DataTypes);
db.EmailVerification = require('./emailVerification')(sequelize, Sequelize.DataTypes);
db.RefreshToken      = require('./refreshToken')(sequelize, Sequelize.DataTypes);
db.Curriculum        = require('./curriculum')(sequelize, Sequelize.DataTypes);
db.Lecture           = require('./lecture')(sequelize, Sequelize.DataTypes);
db.Records           = require('./records')(sequelize, Sequelize.DataTypes);
db.Certificate       = require('./certificate')(sequelize, Sequelize.DataTypes);
db.UserCredits       = require('./userCredits')(sequelize, Sequelize.DataTypes);
db.Timetable         = require('./timetable')(sequelize, Sequelize.DataTypes);
db.RequiredCourse    = require('./requiredCourse')(sequelize, Sequelize.DataTypes);
db.RequiredCredit    = require('./requiredCredit')(sequelize, Sequelize.DataTypes);
db.Review = require('./Review')(sequelize, Sequelize.DataTypes);


// 모델 간 관계 설정
db.User.hasOne(db.UserCredits, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Timetable, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Records,    { foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Certificate,{ foreignKey: 'userId', onDelete: 'CASCADE' });
db.User.hasMany(db.Curriculum, { foreignKey: 'userId', onDelete: 'CASCADE' });

db.Curriculum.hasMany(db.Lecture, { foreignKey: 'curri_id', as: 'lectures', onDelete: 'CASCADE' });
db.Lecture.belongsTo(db.Curriculum, { foreignKey: 'curri_id', as: 'curriculum' });

db.Certificate.belongsTo(db.User, { foreignKey: 'userId' });
db.Records.belongsTo(db.User, { foreignKey: 'userId' });

// Sequelize 인스턴스 추가
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
