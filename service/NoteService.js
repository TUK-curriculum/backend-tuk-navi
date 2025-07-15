const { Note } = require('../models');

class NoteService {
    static async list(userId) {
        return Note.findAll({ where: { userId }, order: [['updatedAt', 'DESC']] });
    }

    static async create(userId, data) {
        return Note.create({ ...data, userId });
    }

    static async update(userId, noteId, data) {
        const note = await Note.findOne({ where: { id: noteId, userId } });
        if (!note) throw new Error('Note not found');
        await note.update({ ...data, updatedAt: new Date() });
        return note;
    }

    static async remove(userId, noteId) {
        return Note.destroy({ where: { id: noteId, userId } });
    }
}

module.exports = NoteService; 