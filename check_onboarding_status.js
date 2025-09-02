const { User, UserProfile } = require('./models');

async function checkOnboardingStatus() {
    try {
        const user = await User.findOne({
            where: { email: 'wlsgks@naver.com' },
            include: [{
                model: UserProfile,
                required: false
            }]
        });

        if (user) {
            console.log('📋 사용자 정보:');
            console.log('- 이름:', user.UserProfile?.name);
            console.log('- 이메일:', user.email);
            console.log('- 학번:', user.UserProfile?.student_id);
            console.log('- 학년:', user.UserProfile?.grade);
            console.log('- 온보딩 완료:', user.UserProfile?.onboarding_completed);
            
            // 테스트를 위해 onboarding_completed를 false로 설정
            if (user.UserProfile && user.UserProfile.onboarding_completed !== false) {
                await user.UserProfile.update({ onboarding_completed: false });
                console.log('테스트를 위해 onboarding_completed를 false로 설정했습니다.');
            }
        } else {
            console.log('사용자를 찾을 수 없습니다.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('에러:', error);
        process.exit(1);
    }
}

checkOnboardingStatus();
