module.exports = (sequelize, DataTypes) => {
  const RecentLecture = sequelize.define('RecentLecture', {
      id: {
        type: DataTypes.INTEGER, 
        primaryKey: true,
        autoIncrement: true 
      },
      code: { 
        type: DataTypes.STRING(20), 
        allowNull: false 
      },
      name: { 
        type: DataTypes.STRING(50), 
        allowNull: false 
      },
      credits: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
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
        type: DataTypes.ENUM('1', '2', '3', '4'),
        allowNull: false,
      },
      major: {
        type: DataTypes.ENUM('CE', 'SW', 'LA'),
        allowNull: false,
      },
      team_project: {
        type: DataTypes.ENUM('Y', 'N', 'A'),
        allowNull: true,
      },
    },
    {
      tableName: 'recent_lectures',
      timestamps: false,
      underscored: false,
    }
  );

  return RecentLecture;
};