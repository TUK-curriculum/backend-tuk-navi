// models/emailVerification.js
module.exports = (sequelize, DataTypes) => {
    const EmailVerification = sequelize.define('EmailVerification', {
      email: { 
        type: DataTypes.STRING, 
        primaryKey: true, 
        allowNull: false 
      },
      code: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      expiresAt: { 
        type: DataTypes.DATE, 
        allowNull: false 
      }
    }, {
      tableName: 'email_verifications',
      timestamps: false,
    });
    return EmailVerification;
  };
  