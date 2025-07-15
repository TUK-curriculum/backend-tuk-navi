const { User, UserProfile } = require('./models');

async function checkUserProfiles() {
    try {
        console.log('최근 가입한 사용자들의 UserProfile 확인...');
        
        const users = await User.findAll({
            include: [{
                model: UserProfile,
                required: false
            }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });
        
        for (const user of users) {
            console.log(`\n사용자: ${user.email}`);
            console.log(`  가입일: ${user.createdAt}`);
            if (user.UserProfile) {
                console.log(`  이름: ${user.UserProfile.name}`);
                console.log(`  학번: ${user.UserProfile.student_id}`);
                console.log(`  전공: ${user.UserProfile.major}`);
                console.log(`  학년: ${user.UserProfile.grade}`);
                console.log(`  학기: ${user.UserProfile.semester}`);
            } else {
                console.log('  UserProfile 없음');
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('에러:', error);
        process.exit(1);
    }
}

checkUserProfiles();
