module.exports = (sequelize, DataTypes) => {
    const CompletedCourse = sequelize.define('CompletedCourse', {
        userId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            field: 'user_id'
        },
        courseId: {
            type: DataTypes.STRING(20),
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

    CompletedCourse.associate = models => {
        CompletedCourse.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
        CompletedCourse.belongsTo(models.Course, { foreignKey: 'courseId', onDelete: 'CASCADE' });
    };

    return CompletedCourse;
}; 