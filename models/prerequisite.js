module.exports = (sequelize, DataTypes) => {
  const Prerequisite = sequelize.define('Prerequisite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    lecture_code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pre_lecture_code: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'prerequisite',
    timestamps: false
  });

  return Prerequisite;
};