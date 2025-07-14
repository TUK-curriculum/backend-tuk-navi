require('dotenv').config(); // .env 파일을 읽어오는 코드 추가

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,   // DB 이름
  process.env.MYSQL_USER,        // 사용자
  process.env.MYSQL_PASSWORD,    // 비밀번호
  {
    host: process.env.MYSQL_HOST,   // 호스트
    dialect: 'mysql',               // MySQL 사용
    logging: false                  // SQL 쿼리 콘솔 출력 끄기
  }
);

module.exports = sequelize;
