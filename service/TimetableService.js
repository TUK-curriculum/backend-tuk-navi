const { Schedule, TimetableSlot, CustomEvent, Sequelize } = require('../models');

class TimetableService {
    static async getCurrent(userId) {
        const schedule = await Schedule.findOne({
            where: { userId },
            order: [['updatedAt', 'DESC']],
            include: [
                { model: TimetableSlot, as: 'TimetableSlots', required: false },
                { model: CustomEvent, as: 'CustomEvents', required: false }
            ]
        });
        return schedule;
    }

    static async getHistory(userId) {
        return Schedule.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'semesterCode', 'createdAt', 'updatedAt']
        });
    }

    static async save(userId, { semesterCode, slots = [], events = [] }) {
        // create new schedule entry
        const schedule = await Schedule.create({ userId, semesterCode });

        // bulk create slots
        const slotRecords = slots.map(s => ({ ...s, scheduleId: schedule.id }));
        const eventRecords = events.map(e => ({ ...e, scheduleId: schedule.id }));
        if (slotRecords.length) await TimetableSlot.bulkCreate(slotRecords);
        if (eventRecords.length) await CustomEvent.bulkCreate(eventRecords);
        return this.getScheduleById(schedule.id);
    }

    static async getScheduleById(id) {
        return Schedule.findByPk(id, {
            include: [
                { model: TimetableSlot, as: 'TimetableSlots', required: false },
                { model: CustomEvent, as: 'CustomEvents', required: false }
            ]
        });
    }
}

module.exports = TimetableService; 