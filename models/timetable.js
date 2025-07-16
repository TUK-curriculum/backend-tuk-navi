// models/timetable.js
module.exports = (sequelize, DataTypes) => {
  const Timetable = sequelize.define('Timetable', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    semester: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dayOfWeek: {
      type: DataTypes.STRING,
      allowNull: false
    },
    courseName: {
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
    }
  }, {
    tableName: 'timetables'
  });

  Timetable.associate = models => {
    Timetable.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Timetable;
};
