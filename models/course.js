module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('Course', {
        id: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(120),
            allowNull: false
        },
        category: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        type: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        credits: {
            type: DataTypes.SMALLINT,
            allowNull: false
        },
        year: {
            type: DataTypes.SMALLINT
        },
        semester: {
            type: DataTypes.SMALLINT
        },
        description: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'courses',
        timestamps: false
    });

    Course.associate = models => {
        Course.hasMany(models.CourseSchedule, { foreignKey: 'courseId', as: 'schedules', onDelete: 'CASCADE' });
        Course.hasMany(models.Enrollment, { foreignKey: 'courseId', onDelete: 'CASCADE' });
        Course.hasMany(models.CompletedCourse, { foreignKey: 'courseId', onDelete: 'CASCADE' });
        Course.hasMany(models.TimetableSlot, { foreignKey: 'courseId', onDelete: 'SET NULL' });
    };

    return Course;
}; 