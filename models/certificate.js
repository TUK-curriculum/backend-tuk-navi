// models/certificate.js
module.exports = (sequelize, DataTypes) => {
  const Certificate = sequelize.define('Certificate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.UUID,
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

  Certificate.associate = models => {
    Certificate.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Certificate;
};
