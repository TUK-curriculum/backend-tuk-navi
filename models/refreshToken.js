// models/refreshToken.js
module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    token: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: 'refresh_tokens',
    timestamps: true,
  });
  return RefreshToken;
};
