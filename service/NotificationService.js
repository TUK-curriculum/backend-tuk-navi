const { Notification } = require('../models');

class NotificationService {
    static async list(userId) {
        return Notification.findAll({ where: { userId }, order: [['timestamp', 'DESC']] });
    }

    static async markRead(userId, ids = []) {
        const where = { userId };
        if (ids.length) where.id = ids;
        return Notification.update({ isRead: true }, { where });
    }

    static async create(userId, data) {
        return Notification.create({ ...data, userId });
    }
}

module.exports = NotificationService; 