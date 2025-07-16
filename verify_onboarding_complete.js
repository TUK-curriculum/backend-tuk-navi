const { User, UserProfile } = require('./models');

async function verifyOnboardingComplete() {
    try {
        const user = await User.findOne({
            where: { email: '7@7.com' },
            include: [{
                model: UserProfile,
                required: false
            }]
        });

        if (user && user.UserProfile) {
            console.log('📋 현재 온보딩 상태:');
            console.log('- 이름:', user.UserProfile.name);
            console.log('- 온보딩 완료:', user.UserProfile.onboarding_completed);
            console.log('- 학년:', user.UserProfile.grade);
            console.log('- 이수학점:', user.UserProfile.completed_credits);
            console.log('- 관심사:', user.UserProfile.interests);

            if (user.UserProfile.onboarding_completed) {
                console.log('✅ 온보딩이 완료되었습니다! 다음 로그인부터는 모달이 뜨지 않을 것입니다.');
            } else {
                console.log('⏳ 온보딩이 아직 완료되지 않았습니다.');
            }
        } else {
            console.log('❌ 사용자를 찾을 수 없습니다.');
        }

        process.exit(0);
    } catch (error) {
        console.error('에러:', error);
        process.exit(1);
    }
}

verifyOnboardingComplete();
