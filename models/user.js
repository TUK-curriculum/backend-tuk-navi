// models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED, 
      primaryKey: true,
      autoIncrement: true, 
      allowNull: false
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

  return User;
};
