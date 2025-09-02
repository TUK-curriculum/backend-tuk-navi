'use strict';

module.exports = (sequelize, DataTypes) => {
  const Opinion = sequelize.define('Opinion', {
    opinion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
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

  return Opinion;
};
