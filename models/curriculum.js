// models/curriculum.js
module.exports = (sequelize, DataTypes) => {
  const Curriculum = sequelize.define('Curriculum', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'curriculums'
  });

  Curriculum.associate = models => {
    Curriculum.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Curriculum.hasMany(models.Lecture, { foreignKey: 'curri_id', as: 'lectures', onDelete: 'CASCADE' });
  };

  return Curriculum;
};
