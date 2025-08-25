// models/certificate.js
module.exports = (sequelize, DataTypes) => {
  const Certificate = sequelize.define('Certificate', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false
    },
    score: {
      type: DataTypes.STRING,
      allowNull: false
    },
    certifiedDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'certificates'
  });

  return Certificate;
};
