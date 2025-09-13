module.exports = (sequelize, DataTypes) => {
  const Professor = sequelize.define('Professor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    major_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'major',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    tel: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    office: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    position: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    research_area: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    profile_uri: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    tableName: 'professor',
    timestamps: false,
    underscored: true
  });

  return Professor;
};