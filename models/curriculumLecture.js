module.exports = (sequelize, DataTypes) => {
  const CurriculumLecture = sequelize.define('CurriculumLecture', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    curri_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'curriculums',
        key: 'id',
      },
      field: 'curri_id'
    },
    lect_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'lecture_code',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    semester: {
      type: DataTypes.ENUM('1', '2', 'S', 'W'),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('GR', 'GE', 'MR', 'ME', 'RE', 'FE'),
      allowNull: false,
      comment: 'GR: 교필, GE: 교선, MR: 전필, ME: 전선, RE: 현장연구, FE: 자선',
    },
    grade: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'curri_lectures',
    underscored: true,
    timestamps: false,
  });

  return CurriculumLecture;
};
