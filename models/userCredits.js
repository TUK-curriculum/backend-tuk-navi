// models/userCredits.js
module.exports = (sequelize, DataTypes) => {
  const UserCredits = sequelize.define('UserCredits', {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    totalCredits: {
      type: DataTypes.INTEGER,
      defaultValue: 140
    },
    completedCredits: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'user_credits'
  });

  UserCredits.associate = models => {
    UserCredits.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return UserCredits;
};
