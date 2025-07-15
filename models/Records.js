// models/records.js
module.exports = (sequelize, DataTypes) => {
  const Records = sequelize.define('Records', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    grade: {
      type: DataTypes.STRING,
      allowNull: false
    },
    semester: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'records'
  });

  Records.associate = models => {
    Records.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Records;
};
