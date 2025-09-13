module.exports = (sequelize, DataTypes) => {
  const Records = sequelize.define('Records', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    courseCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    credits: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: true
    },
    semester: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    instructor: {
      type: DataTypes.STRING(80),
      allowNull: true,
      comment: '담당 교수'
    },
    room: {
      type: DataTypes.STRING(60),
      allowNull: true,
      comment: '강의실'
    },
    timeSlots: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '시간 정보 (JSON 형태)'
    },
    sourceScheduleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '원본 시간표 ID'
    },
    conversionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '변환 일시'
    }
  }, {
    tableName: 'records',
    timestamps: true
  });

  return Records;
};