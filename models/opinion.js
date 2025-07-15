'use strict';

module.exports = (sequelize, DataTypes) => {
  const Opinion = sequelize.define('Opinion', {
    opinion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    curri_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  }, {
    tableName: 'opinions',
    timestamps: true,
  });

  Opinion.associate = (models) => {
    Opinion.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Opinion.belongsTo(models.Curriculum, { foreignKey: 'curri_id', as: 'curriculum' });
  };

  return Opinion;
};
