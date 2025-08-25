const { UserProfile } = require('./models');

async function updateExistingUserGrade() {
    try {
        const studentId = '2022150049';
        console.log(`학번 ${studentId} 사용자의 학년을 4학년으로 업데이트...`);
        
        const profile = await UserProfile.findOne({
            where: { student_id: studentId }
        });
        
        if (profile) {
            console.log(`현재 grade: ${profile.grade}`);
            await profile.update({ grade: 4 });
            console.log(`업데이트 후 grade: ${profile.grade}`);
            console.log('학년 업데이트 완료');
        } else {
            console.log('해당 사용자를 찾을 수 없습니다.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('에러:', error);
        process.exit(1);
    }
}

updateExistingUserGrade();
