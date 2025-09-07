module.exports = (sequelize, DataTypes) => {
    const TimetableSlot = sequelize.define('TimetableSlot', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        scheduleId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'schedule_id'
        },
        codeId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            field: 'code_id'
        },
        courseName: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'course_name'
        },
        dayOfWeek: {
            type: DataTypes.STRING(10),
            field: 'day_of_week'
        },
        startPeriod: {
            type: DataTypes.SMALLINT,
            field: 'start_period'
        },
        endPeriod: {
            type: DataTypes.SMALLINT,
            field: 'end_period'
        },
        startTime: {
            type: DataTypes.TIME,
            field: 'start_time'
        },
        endTime: {
            type: DataTypes.TIME,
            field: 'end_time'
        },
        room: {
            type: DataTypes.STRING(60)
        },
        instructor: {
            type: DataTypes.STRING(80)
        },
        color: {
            type: DataTypes.STRING(10)
        },
        credits: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING(20),
            allowNull: false
        }
    }, {
        tableName: 'timetable_slots',
        underscored: true,
        timestamps: false
    });

    return TimetableSlot;
};  onDelete: 'SET NULL'