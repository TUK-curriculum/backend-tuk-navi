// models/lecture.js
module.exports = (sequelize, DataTypes) => {
  const Lecture = sequelize.define('Lecture', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    prof_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    code_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    grade: {
      type: DataTypes.ENUM('1', '2', '3', '4'),
      allowNull: false,
    },
    semester: {
      type: DataTypes.ENUM('1', '2'),
      allowNull: false,
    },
    room: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    schedule: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    max_students: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    team_project: {
      type: DataTypes.ENUM('Y', 'N'),
      allowNull: true,
    },
  }, {
    tableName: 'lectures',
    underscored: true,
    timestamps: false,
  });

  return Lecture;
};