const { Course, Enrollment, CompletedCourse, CourseSchedule, Sequelize, RecentLecture } = require('../models');
const { Op } = Sequelize;
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

class CourseService {
    // ===== 기본 Course =====
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
        if (filter.day) where['$schedules.day_of_week$'] = filter.day;
        if (filter.instructor) where['$schedules.instructor$'] = { [Op.like]: `%${filter.instructor}%` };
        if (filter.credits) where.credits = filter.credits;

        return Course.findAll({
        where,
        include: [{ model: CourseSchedule, as: 'schedules', required: false }],
        offset,
        limit,
        });
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
        return Course.create(data);
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
        const targetSlots = await CourseSchedule.findAll({ where: { courseId } });
        if (!targetSlots.length) return { hasConflict: false };

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

    // ===== Recent Lectures (강의 기본 정보) =====
    static async listRecentLectures({ semester, major = 'CE' }) {
        return RecentLecture.findAll({
        where: { semester, major },
        order: [['code', 'ASC']],
        });
    }

    static async getRecentLecture(code) {
        return RecentLecture.findOne({ where: { code } });
    }

    // ===== S3 Syllabus (강의계획서) =====
    static async getSyllabiByCourseCode(semester, courseCode) {
        // semester 값이 '1' 이면 2025, '2' 이면 2024 로 처리
        const year = semester === '1' ? '2025' : '2024';
        const semesterCode = `${year}-${semester}`;

        const prefix = `${process.env.AWS_FOLDER_PREFIX}${semesterCode}/`;

        console.log('[getSyllabiByCourseCode] Searching S3 prefix:', prefix);

        try {
            const { Contents } = await s3.listObjectsV2({
                Bucket: process.env.AWS_BUCKET_NAME,
                Prefix: prefix,
            }).promise();

            if (!Contents || Contents.length === 0) return [];

            const pdfs = Contents.filter(obj =>
                obj.Key.endsWith('.pdf') && obj.Key.includes(courseCode)
            );

            return pdfs.map(obj => {
                const fileName = obj.Key.split('/').pop().replace('.pdf', '');
                const [code, section, professor, ...courseNameParts] = fileName.split('-');
                const courseName = courseNameParts.join('-');

                return {
                    courseCode: code,
                    section,
                    professor,
                    courseName,
                    url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`,
                };
            });
        } catch (err) {
            console.error('[getSyllabiByCourseCode] S3 검색 오류:', err);
            return [];
        }
    }
}

module.exports = CourseService;