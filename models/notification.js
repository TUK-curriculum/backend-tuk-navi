module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
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

    Notification.associate = models => {
        Notification.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    };

    return Notification;
}; 