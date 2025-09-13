module.exports = (sequelize, DataTypes) => {
    const CourseSchedule = sequelize.define('CourseSchedule', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        courseId: {
            type: DataTypes.INTEGER.UNSIGNED,
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

    return CourseSchedule;
}; 