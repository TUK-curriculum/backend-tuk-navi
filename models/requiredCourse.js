// models/requiredCourse.js
module.exports = (sequelize, DataTypes) => {
  const RequiredCourse = sequelize.define('RequiredCourse', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('pre', 'major', 'design', 'network', 'capstone', 'practice'),
      allowNull: false
    },
    semester: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: 'required_courses',
    timestamps: false
  });

  return RequiredCourse;
};
