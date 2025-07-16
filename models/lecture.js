// models/lecture.js
module.exports = (sequelize, DataTypes) => {
  const Lecture = sequelize.define('Lecture', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    curri_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dayOfWeek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    semester: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'lectures'
  });

  Lecture.associate = models => {
    Lecture.belongsTo(models.Curriculum, { foreignKey: 'curri_id', as: 'curriculum' });
  };

  return Lecture;
};
