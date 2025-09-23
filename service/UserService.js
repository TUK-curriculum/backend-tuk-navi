const { User, UserProfile } = require('../models');

class UserService {
    // 전체 사용자 조회
    static async getAllUsers() {
        const users = await User.findAll({
            include: [
                { model: UserProfile, attributes: ['name', 'student_id', 'major', 'grade', 'semester', 'phone'] }
            ],
            order: [['created_at', 'DESC']]
        });

        return users.map(user => {
            const profile = user.UserProfile;
            return {
                id: user.id,
                email: user.email,
                createdAt: user.created_at,
                lastLoginAt: user.lastLoginAt,
                name: profile?.name,
                studentId: profile?.student_id,
                major: profile?.major,
                grade: profile?.grade,
                semester: profile?.semester,
                phone: profile?.phone,
            };
        });
    }

    // 사용자 상세 조회
    static async getUserById(id) {
        const user = await User.findByPk(id, {
            include: [{ model: UserProfile }]
        });
        if (!user) throw new Error('사용자를 찾을 수 없습니다.');

        const profile = user.UserProfile;
        return {
            id: user.id,
            email: user.email,
            createdAt: user.created_at,
            lastLoginAt: user.lastLoginAt,
            name: profile?.name,
            studentId: profile?.student_id,
            major: profile?.major,
            grade: profile?.grade,
            semester: profile?.semester,
            phone: profile?.phone,
        };
    }

    // 사용자 업데이트
    static async updateUser(id, fields) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('사용자를 찾을 수 없습니다.');

        const profile = await UserProfile.findOne({ where: { userId: user.id } });
        if (!profile) throw new Error('UserProfile이 없습니다.');

        await profile.update({
            name: fields.name ?? profile.name,
            major: fields.major ?? profile.major,
            phone: fields.phone ?? profile.phone,
            grade: fields.grade != null ? Number(fields.grade) : profile.grade,
            semester: fields.semester != null ? Number(fields.semester) : profile.semester,
            student_id: fields.studentId ?? profile.student_id,
        });

        return {
            id: user.id,
            email: user.email,
            createdAt: user.created_at,
            lastLoginAt: user.lastLoginAt,
            name: profile.name,
            studentId: profile.student_id,
            major: profile.major,
            grade: profile.grade,
            semester: profile.semester,
            phone: profile.phone,
        };
    }

    // 사용자 삭제
    static async deleteUser(id) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('사용자를 찾을 수 없습니다.');
        await user.destroy();
        return true;
    }
 }

module.exports = UserService;