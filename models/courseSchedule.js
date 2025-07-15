module.exports = (sequelize, DataTypes) => {
    const CourseSchedule = sequelize.define('CourseSchedule', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        courseId: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: 'course_id'
        },
        dayOfWeek: {
            type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday'),
            allowNull: false,
            field: 'day_of_week'
        },
        startPeriod: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            field: 'start_period'
        },
        endPeriod: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            field: 'end_period'
        },
        room: {
            type: DataTypes.STRING(60)
        },
        instructor: {
            type: DataTypes.STRING(80)
        }
    }, {
        tableName: 'course_schedules',
        underscored: true,
        timestamps: false
    });

    CourseSchedule.associate = models => {
        CourseSchedule.belongsTo(models.Course, { foreignKey: 'courseId', onDelete: 'CASCADE' });
    };

    return CourseSchedule;
}; 