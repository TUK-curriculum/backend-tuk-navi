module.exports = (sequelize, DataTypes) => {
    const CompletedCourse = sequelize.define('CompletedCourse', {
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false,
        },
        courseId: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false,
            field: 'course_id'
        },
        grade: {
            type: DataTypes.STRING(2)
        },
        completedAt: {
            type: DataTypes.DATEONLY,
            field: 'completed_at'
        }
    }, {
        tableName: 'completed_courses',
        underscored: true,
        timestamps: false
    });
    
    return CompletedCourse;
}; 