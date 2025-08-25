const { User, UserProfile } = require('./models');

async function updateExistingUsers() {
    try {
        console.log('기존 사용자들의 UserProfile 업데이트 시작...');
        
        const users = await User.findAll({
            include: [{
                model: UserProfile,
                required: false
            }]
        });
        
        console.log(`총 ${users.length}명의 사용자 발견`);
        
        for (const user of users) {
            if (!user.UserProfile) {
                // UserProfile이 없는 경우 생성
                await UserProfile.create({
                    userId: user.id,
                    name: user.username || '사용자',
                    student_id: '2021123456', // 기본값
                    major: user.major || '컴퓨터공학과',
                    phone: user.phone,
                    grade: 3,
                    semester: 1
                });
                console.log(`사용자 ${user.email}의 UserProfile 생성 완료`);
            } else {
                // 기존 UserProfile 업데이트
                if (!user.UserProfile.student_id) {
                    await user.UserProfile.update({
                        student_id: '2021123456'
                    });
                    console.log(`사용자 ${user.email}의 student_id 업데이트 완료`);
                }
            }
        }
        
        console.log('모든 사용자 프로필 업데이트 완료!');
        process.exit(0);
    } catch (error) {
        console.error('에러:', error);
        process.exit(1);
    }
}

updateExistingUsers();
