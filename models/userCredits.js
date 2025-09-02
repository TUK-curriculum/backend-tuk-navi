// models/userCredits.js
module.exports = (sequelize, DataTypes) => {
  const UserCredits = sequelize.define('UserCredits', {
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false
    },
    totalCredits: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 140
    },
    completedCredits: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    }
  }, {
    tableName: 'user_credits'
  });

  return UserCredits;
};
