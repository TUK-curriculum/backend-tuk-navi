module.exports = (sequelize, DataTypes) => {
    const UserStatistics = sequelize.define('UserStatistics', {
        user_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        total_login_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        last_login_date: {
            type: DataTypes.DATEONLY
        },
        total_study_time: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        completed_courses: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        notes_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        messages_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        favorite_courses: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'user_statistics',
        timestamps: false
    });

    return UserStatistics;
}; 