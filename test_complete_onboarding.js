const { User, UserProfile } = require('./models');

async function testCompleteOnboarding() {
    try {
        // 테스트용으로 첫 번째 사용자(test@test.com)의 온보딩을 완료로 설정
        const user = await User.findOne({
            where: { email: 'test@test.com' },
            include: [{
                model: UserProfile,
                required: false
            }]
        });

        if (user && user.UserProfile) {
            await user.UserProfile.update({ onboarding_completed: true });
            console.log('✅ test@test.com 사용자의 온보딩을 완료로 설정했습니다.');

            // 확인
            const updatedUser = await User.findOne({
                where: { email: 'test@test.com' },
                include: [{
                    model: UserProfile,
                    required: false
                }]
            });

            console.log('📋 업데이트 확인:');
            console.log('- 이메일:', updatedUser.email);
            console.log('- 온보딩 완료:', updatedUser.UserProfile.onboarding_completed);
        } else {
            console.log('❌ 사용자를 찾을 수 없습니다.');
        }

        process.exit(0);
    } catch (error) {
        console.error('에러:', error);
        process.exit(1);
    }
}

testCompleteOnboarding(); 