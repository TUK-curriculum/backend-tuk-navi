module.exports = (sequelize, DataTypes) => {
    const UserSettings = sequelize.define('UserSettings', {
        user_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        theme: {
            type: DataTypes.STRING(10),
            defaultValue: 'light'
        },
        notifications: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        auto_save: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        language: {
            type: DataTypes.STRING(5),
            defaultValue: 'ko'
        },
        timezone: {
            type: DataTypes.STRING(60)
        },
        accessibility: {
            type: DataTypes.JSON
        },
        pinned_semester: {
            type: DataTypes.STRING(10)
        },
        access_token: {
            type: DataTypes.TEXT
        },
        refresh_token: {
            type: DataTypes.TEXT
        },
        csrf_token: {
            type: DataTypes.TEXT
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'user_settings',
        timestamps: false
    });

    return UserSettings;
}; 