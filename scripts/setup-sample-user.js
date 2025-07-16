// scripts/setup-sample-user.js
// 샘플 사용자 및 성적 데이터 설정 스크립트

require('dotenv').config();
const db = require('../models');
const { createSampleRecordsForUser } = require('../data/sample-records');
const bcrypt = require('bcrypt');

async function setupSampleUser() {
    try {
        console.log('🚀 [Setup] Starting sample user setup...');

        // 기존 샘플 사용자 확인
        const existingUser = await db.User.findOne({
            where: { email: 'sample@tukorea.ac.kr' }
        });

        let sampleUser;

        if (existingUser) {
            console.log('👤 [Setup] Sample user already exists, updating...');
            sampleUser = existingUser;
        } else {
            // 샘플 사용자 생성
            console.log('👤 [Setup] Creating sample user...');
            const hashedPassword = await bcrypt.hash('sample123!', 12);

            sampleUser = await db.User.create({
                email: 'sample@tukorea.ac.kr',
                password_hash: hashedPassword,
                major: '컴퓨터공학부',
                phone: '010-1234-5678',
                created_at: new Date(),
                last_login_at: new Date()
            });

            // UserProfile 생성
            await db.UserProfile.create({
                user_id: sampleUser.id,
                name: '김한국',
                student_id: '2022150000',
                major: '컴퓨터공학부',
                phone: '010-1234-5678',
                grade: 4,
                semester: 8,
                onboarding_completed: true,
                updated_at: new Date()
            });

            console.log('✅ [Setup] Sample user created:', sampleUser.id);
        }

        // 기존 Records 삭제 (재설정)
        await db.Records.destroy({ where: { userId: sampleUser.id } });
        console.log('🗑️ [Setup] Cleared existing records');

        // 샘플 성적 데이터 추가
        const sampleRecords = createSampleRecordsForUser(sampleUser.id);
        const completedRecords = sampleRecords.filter(record => record.grade !== null);

        if (completedRecords.length > 0) {
            await db.Records.bulkCreate(completedRecords);
            console.log('📚 [Setup] Added', completedRecords.length, 'sample records');
        }

        // UserCredits 업데이트
        const totalCredits = completedRecords.reduce((sum, record) => sum + record.credits, 0);
        await db.UserCredits.upsert({
            userId: sampleUser.id,
            totalCredits: 130,
            completedCredits: totalCredits
        });

        // GraduationInfo 초기화
        await db.GraduationInfo.upsert({
            user_id: sampleUser.id,
            total_credits: totalCredits,
            major_required: 0,
            major_elective: 0,
            general_required: 0,
            general_elective: 0,
            total_required: 130,
            progress_ratio: Math.round((totalCredits / 130) * 100),
            remaining_credits: Math.max(0, 130 - totalCredits),
            updated_at: new Date()
        });

        // 샘플 노트 추가
        await db.Note.destroy({ where: { userId: sampleUser.id } });
        await db.Note.bulkCreate([
            {
                userId: sampleUser.id,
                title: '알고리즘 복습',
                content: '퀵소트와 머지소트의 시간복잡도 비교\n- 퀵소트: 평균 O(n log n), 최악 O(n²)\n- 머지소트: 항상 O(n log n)',
                category: '전공',
                isPinned: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: sampleUser.id,
                title: '데이터베이스 과제 정리',
                content: 'ER 다이어그램 설계 요점\n1. 엔티티 식별\n2. 관계 정의\n3. 속성 결정\n4. 정규화 적용',
                category: '과제',
                isPinned: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: sampleUser.id,
                title: '네트워크 프로그래밍 요약',
                content: 'TCP vs UDP 차이점\n- TCP: 연결지향, 신뢰성, 순서보장\n- UDP: 비연결지향, 빠름, 실시간통신',
                category: '학습',
                isPinned: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        // 샘플 알림 추가
        await db.Notification.destroy({ where: { userId: sampleUser.id } });
        await db.Notification.bulkCreate([
            {
                userId: sampleUser.id,
                title: '졸업 요건 진단',
                message: '현재까지 89학점을 이수했습니다. 졸업까지 41학점이 남았습니다.',
                notifType: 'info',
                isRead: false,
                timestamp: new Date()
            },
            {
                userId: sampleUser.id,
                title: '추천 과목 알림',
                message: '다음 학기에 \'종합설계기획\' 과목 수강을 권장합니다.',
                notifType: 'info',
                isRead: false,
                timestamp: new Date()
            },
            {
                userId: sampleUser.id,
                title: '성적 업데이트',
                message: '2023-2학기 성적이 업데이트되었습니다.',
                notifType: 'info',
                isRead: true,
                timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7일 전
            }
        ]);

        console.log('✅ [Setup] Sample user setup completed successfully!');
        console.log('📧 [Setup] Login credentials:');
        console.log('   Email: sample@tukorea.ac.kr');
        console.log('   Password: sample123!');
        console.log('👤 [Setup] User Info:');
        console.log('   Name: 김한국');
        console.log('   Student ID: 2022150000');
        console.log('   Grade: 4학년');
        console.log('   Major: 컴퓨터공학부');
        console.log(`📊 [Setup] Academic Records: ${completedRecords.length} courses, ${totalCredits} credits`);

    } catch (error) {
        console.error('❌ [Setup] Sample user setup failed:', error);
        throw error;
    }
}

// 스크립트 실행
if (require.main === module) {
    setupSampleUser()
        .then(() => {
            console.log('🎉 [Setup] All done! You can now test with the sample user.');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 [Setup] Setup failed:', error.message);
            process.exit(1);
        });
}

module.exports = { setupSampleUser }; 