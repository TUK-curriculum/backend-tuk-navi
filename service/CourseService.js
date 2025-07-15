const { Course, Enrollment, CompletedCourse, CourseSchedule, Sequelize } = require('../models');
const { Op } = Sequelize;

class CourseService {
    // 페이징/필터링 목록
    static async list({ page = 1, limit = 20, filter = {} }) {
        const offset = (page - 1) * limit;
        const where = {};

        if (filter.query) {
            where[Op.or] = [
                { name: { [Op.like]: `%${filter.query}%` } },
                { id: { [Op.like]: `%${filter.query}%` } },
            ];
        }
        if (filter.type) where.type = filter.type;
        if (filter.day) where['$schedules.day_of_week$'] = filter.day; // join later
        if (filter.instructor) where['$schedules.instructor$'] = { [Op.like]: `%${filter.instructor}%` };
        if (filter.credits) where.credits = filter.credits;

        const courses = await Course.findAll({
            where,
            include: [{ model: CourseSchedule, as: 'schedules', required: false }],
            offset,
            limit,
        });
        return courses;
    }

    static async getById(id) {
        return Course.findByPk(id, {
            include: [{ model: CourseSchedule, as: 'schedules', required: false }],
        });
    }

    static async search(params) {
        return this.list({ filter: params, page: 1, limit: 1000 });
    }

    static async create(data) {
        const course = await Course.create(data);
        return course;
    }

    static async update(id, data) {
        const course = await this.getById(id);
        if (!course) throw new Error('Course not found');
        await course.update(data);
        return course;
    }

    static async remove(id) {
        const course = await this.getById(id);
        if (!course) throw new Error('Course not found');
        await course.destroy();
    }

    // ===== Enrollment =====
    static async enroll({ courseId, studentId, semester }) {
        // Check if already enrolled
        const exists = await Enrollment.findOne({ where: { courseId, userId: studentId, semesterCode: semester } });
        if (exists) throw new Error('Already enrolled');
        return Enrollment.create({ courseId, userId: studentId, semesterCode: semester });
    }

    static async drop({ courseId, studentId }) {
        return Enrollment.destroy({ where: { courseId, userId: studentId } });
    }

    static async getCompleted(studentId) {
        return CompletedCourse.findAll({ where: { userId: studentId } });
    }

    static async checkConflict(courseId, studentId) {
        // Fetch schedules of target course
        const targetSlots = await CourseSchedule.findAll({ where: { courseId } });
        if (!targetSlots.length) return { hasConflict: false };

        // Get courses student enrolled in same semester? We'll ignore semester param for now
        const enrollments = await Enrollment.findAll({ where: { userId: studentId } });
        if (!enrollments.length) return { hasConflict: false };

        const enrolledCourseIds = enrollments.map(e => e.courseId);
        const enrolledSlots = await CourseSchedule.findAll({ where: { courseId: enrolledCourseIds } });

        const conflicts = [];
        targetSlots.forEach(t => {
            enrolledSlots.forEach(s => {
                if (t.dayOfWeek === s.dayOfWeek && !(t.endPeriod < s.startPeriod || t.startPeriod > s.endPeriod)) {
                    conflicts.push(s.courseId);
                }
            });
        });
        if (!conflicts.length) return { hasConflict: false };
        const conflictingCourses = await Course.findAll({ where: { id: conflicts } });
        return { hasConflict: true, conflictingCourses };
    }
}

module.exports = CourseService; 