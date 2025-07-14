// models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    major: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    provider: {
      type: DataTypes.STRING,
      defaultValue: 'local'
    }
  }, {
    tableName: 'users'
  });

  User.associate = models => {
    User.hasOne(models.UserCredits, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Timetable,  { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Records,    { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Certificate,{ foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Curriculum, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return User;
};
