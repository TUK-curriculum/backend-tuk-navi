module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(120)
        },
        message: {
            type: DataTypes.TEXT
        },
        notifType: {
            type: DataTypes.STRING(10),
            field: 'notif_type'
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_read'
        },
        actionUrl: {
            type: DataTypes.TEXT,
            field: 'action_url'
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'notifications',
        underscored: true,
        timestamps: false
    });

    return Notification;
}; 