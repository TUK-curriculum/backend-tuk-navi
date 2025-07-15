module.exports = (sequelize, DataTypes) => {
    const Enrollment = sequelize.define('Enrollment', {
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
        semesterCode: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            allowNull: false,
            field: 'semester_code'
        },
        status: {
            type: DataTypes.STRING(10),
            defaultValue: 'enrolled'
        },
        enrolledAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'enrolled_at'
        }
    }, {
        tableName: 'enrollments',
        underscored: true,
        timestamps: false
    });

    Enrollment.associate = models => {
        Enrollment.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
        Enrollment.belongsTo(models.Course, { foreignKey: 'courseId', onDelete: 'CASCADE' });
    };

    return Enrollment;
};

