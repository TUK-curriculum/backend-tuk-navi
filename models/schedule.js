module.exports = (sequelize, DataTypes) => {
    const Schedule = sequelize.define('Schedule', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'user_id'
        },
        semesterCode: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: 'semester_code'
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: () => new Date().getFullYear()
        }
    }, {
        tableName: 'schedules',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Schedule;
};