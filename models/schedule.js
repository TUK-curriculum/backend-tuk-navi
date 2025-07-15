module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define('Schedule', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id'
        },
        semesterCode: {
            type: DataTypes.STRING(10),
            field: 'semester_code'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
        }
    }, {
        tableName: 'schedules',
        underscored: true
    });

    Schedule.associate = models => {
        Schedule.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
        Schedule.hasMany(models.TimetableSlot, { foreignKey: 'scheduleId', as: 'TimetableSlots', onDelete: 'CASCADE' });
        Schedule.hasMany(models.CustomEvent, { foreignKey: 'scheduleId', as: 'CustomEvents', onDelete: 'CASCADE' });
    };

    return Schedule;
}; 