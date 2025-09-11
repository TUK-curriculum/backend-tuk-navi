module.exports = (sequelize, DataTypes) => {
  const LectureReplacement = sequelize.define('LectureReplacement', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    original_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    original_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    replacement_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    replacement_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  }, {
    tableName: 'lecture_replacement',
    timestamps: false,
    underscored: true,
  });

  return LectureReplacement;
};