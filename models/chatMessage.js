module.exports = (sequelize, DataTypes) => {
    const ChatMessage = sequelize.define('ChatMessage', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
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

    return ChatMessage;
}; 