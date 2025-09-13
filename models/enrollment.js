module.exports = (sequelize, DataTypes) => {
    const Enrollment = sequelize.define('Enrollment', {
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

    return Enrollment;
};

