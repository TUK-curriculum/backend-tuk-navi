module.exports = (sequelize, DataTypes) => {
  const LectureCode = sequelize.define('LectureCode', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('GR', 'GE', 'MR', 'ME', 'RE', 'FE'),
      allowNull: false,
      comment: 'GR: 교필, GE: 교선, MR: 전필, ME: 전선, RE: 현장연구, FE: 자선',
    },
    grade: {
      type: DataTypes.ENUM('1', '2', '3', '4'),
      allowNull: false,
    },
    lecture_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lecture_objectives: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'lecture_code',
    underscored: true,
    timestamps: false,
  });

  return LectureCode;
};