module.exports = (sequelize, DataTypes) => {
    const CustomEvent = sequelize.define('CustomEvent', {
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
        title: {
            type: DataTypes.STRING(120)
        },
        description: {
            type: DataTypes.TEXT
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
        color: {
            type: DataTypes.STRING(10)
        },
        isRecurring: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_recurring'
        }
    }, {
        tableName: 'custom_events',
        underscored: true,
        timestamps: false
    });

    return CustomEvent;
}; 