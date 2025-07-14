// models/requiredCredit.js
module.exports = (sequelize, DataTypes) => {
  const RequiredCredit = sequelize.define('RequiredCredit', {
    type: {
      type: DataTypes.ENUM('total', 'liberal', 'major'),
      allowNull: false,
      primaryKey: true
    },
    creditCount: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'required_credits',
    timestamps: false
  });

  return RequiredCredit;
};
