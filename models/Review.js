// models/Review.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'records', // ✅ 반드시 'records' 테이블 참조
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'reviews',   // ✅ 실제 DB 테이블 이름 지정
    timestamps: true,       // ✅ createdAt, updatedAt 자동 관리
    underscored: false      // ✅ 컬럼 이름 카멜케이스 그대로 유지
  });

  Review.associate = (models) => {
    Review.belongsTo(models.Records, { foreignKey: 'recordId', onDelete: 'CASCADE' });
    Review.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return Review;
};
