module.exports = (sequelize, DataTypes) => {
  const RequiredKnowledge = sequelize.define('RequiredKnowledge', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    lecture_code: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    required_lecture_code: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'required_knowledge',
    timestamps: false
  });

  return RequiredKnowledge;
};