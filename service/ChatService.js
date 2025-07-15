const { ChatMessage } = require('../models');

class ChatService {
    static async addMessage(userId, { content, sender = 'user', msgType = 'text', metadata = {} }) {
        return ChatMessage.create({ userId, content, sender, msgType, metadata });
    }

    static async history(userId, limit = 100) {
        return ChatMessage.findAll({
            where: { userId },
            order: [['timestamp', 'DESC']],
            limit
        });
    }
}

module.exports = ChatService; 