// models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'password_hash'
    },
    provider: {
      type: DataTypes.STRING(20),
      defaultValue: 'local'
    },
    major: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    last_login_at: {
      type: DataTypes.DATE,
      field: 'last_login_at'
    }
  }, {
    tableName: 'users',
    underscored: true
  });

  User.associate = models => {
    User.hasOne(models.UserProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    User.hasOne(models.UserCredits, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Timetable, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Records, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Certificate, { foreignKey: 'userId', onDelete: 'CASCADE' });
    User.hasMany(models.Curriculum, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return User;
};
