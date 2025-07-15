module.exports = (sequelize, DataTypes) => {
    const ChatMessage = sequelize.define('ChatMessage', {
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
        sender: {
            type: DataTypes.ENUM('user', 'assistant'),
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT
        },
        msgType: {
            type: DataTypes.STRING(10),
            defaultValue: 'text',
            field: 'msg_type'
        },
        metadata: {
            type: DataTypes.JSON
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'chat_messages',
        underscored: true,
        timestamps: false
    });

    ChatMessage.associate = models => {
        ChatMessage.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    };

    return ChatMessage;
}; 