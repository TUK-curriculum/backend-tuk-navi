const bcrypt = require('bcrypt');
const { User } = require('./models');

async function resetPassword() {
    try {
        const email = 'elfpmh@naver.com';
        const newPassword = 'TestPass123!';
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('사용자를 찾을 수 없습니다.');
            return;
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password_hash: hashedPassword });
        
        console.log(`사용자 ${email}의 비밀번호가 ${newPassword}로 변경되었습니다.`);
        process.exit(0);
    } catch (error) {
        console.error('에러:', error);
        process.exit(1);
    }
}

resetPassword();
