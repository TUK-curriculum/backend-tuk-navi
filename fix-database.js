require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        dialect: 'mysql',
        logging: false
    }
);

async function fixDatabase() {
    try {
        console.log('🔧 데이터베이스 수정 시작...');

        // 외래키 체크 비활성화
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('🔒 외래키 체크 비활성화 완료');

        // 모든 테이블 삭제
        const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
    `);

        console.log('🗑️  모든 테이블 삭제 중...');
        for (const table of tables) {
            const tableName = table.table_name;
            if (tableName) {
                console.log(`삭제 중: ${tableName}`);
                await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
            }
        }

        // 외래키 체크 재활성화
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('모든 테이블 삭제 완료');

        // 모델 동기화
        const db = require('./models');
        await db.sequelize.sync({ force: true });
        console.log('테이블 재생성 완료');

        console.log('🎉 데이터베이스 수정 완료!');
        process.exit(0);
    } catch (error) {
        console.error('데이터베이스 수정 실패:', error);
        process.exit(1);
    }
}

fixDatabase(); 