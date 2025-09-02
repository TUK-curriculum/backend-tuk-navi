module.exports = (sequelize, DataTypes) => {
  const LectureHistory = sequelize.define('LectureHistory', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    lect_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    enroll_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    complete_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'lecture_history',
    underscored: true,
    timestamps: false,
  });

  return LectureHistory;
};