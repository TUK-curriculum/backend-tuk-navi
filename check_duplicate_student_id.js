const { UserProfile } = require('./models');

async function checkDuplicateStudentId() {
    try {
        const studentId = '2022150049';
        console.log(`학번 ${studentId}를 가진 사용자 확인...`);
        
        const existingProfile = await UserProfile.findOne({
            where: { student_id: studentId }
        });
        
        if (existingProfile) {
            console.log('기존 사용자 발견:');
            console.log(`  userId: ${existingProfile.userId}`);
            console.log(`  name: ${existingProfile.name}`);
            console.log(`  student_id: ${existingProfile.student_id}`);
            console.log(`  grade: ${existingProfile.grade}`);
        } else {
            console.log('해당 학번의 사용자가 없습니다.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('에러:', error);
        process.exit(1);
    }
}

checkDuplicateStudentId();
