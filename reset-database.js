// reset-database.js
require('dotenv').config();

const mysql = require('mysql2/promise');
const sequelize = require('./config/database');
const dbModels = require('./models');

const DB_NAME = process.env.MYSQL_DATABASE;
const DB_HOST = process.env.MYSQL_HOST;
const DB_USER = process.env.MYSQL_USER;
const DB_PASSWORD = process.env.MYSQL_PASSWORD;

async function resetDatabase() {
    try {
        console.log('🔧  Starting full database reset (method #1)...');

        /* -------------------------------------------------- */
        /* 1. Connect to MySQL _without_ a default database   */
        /* -------------------------------------------------- */
        console.log('🔗  Connecting to MySQL server...');
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            multipleStatements: true
        });

        /* -------------------------------------------------- */
        /* 2. Drop & recreate the target database            */
        /* -------------------------------------------------- */
        console.log(`🗑️   Dropping database \`${DB_NAME}\` if it exists...`);
        await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);

        console.log(`📦  Creating database \`${DB_NAME}\`...`);
        await connection.query(
            `CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
        );

        await connection.end();
        console.log('✅  Database dropped & recreated successfully.');

        /* -------------------------------------------------- */
        /* 3. Re-sync Sequelize models (force=true)           */
        /* -------------------------------------------------- */
        console.log('🔄  Syncing Sequelize models (force: true)...');
        await dbModels.sequelize.sync({ force: true });
        console.log('✅  All tables created with UUID columns.');

        console.log('\n🎉  Database reset complete! You can now start the server normally.');
        process.exit(0);
    } catch (error) {
        console.error('❌  Failed to reset database:', error);
        process.exit(1);
    }
}

resetDatabase();
require('dotenv').config();

const mysql = require('mysql2/promise');
const sequelize = require('./config/database');
const dbModels = require('./models');

const DB_NAME = process.env.MYSQL_DATABASE;
const DB_HOST = process.env.MYSQL_HOST;
const DB_USER = process.env.MYSQL_USER;
const DB_PASSWORD = process.env.MYSQL_PASSWORD;

async function resetDatabase() {
    try {
        console.log('🔧  Starting full database reset (method #1)...');

        /* -------------------------------------------------- */
        /* 1. Connect to MySQL _without_ a default database   */
        /* -------------------------------------------------- */
        console.log('🔗  Connecting to MySQL server...');
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            multipleStatements: true
        });

        /* -------------------------------------------------- */
        /* 2. Drop & recreate the target database            */
        /* -------------------------------------------------- */
        console.log(`🗑️   Dropping database \`${DB_NAME}\` if it exists...`);
        await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);

        console.log(`📦  Creating database \`${DB_NAME}\`...`);
        await connection.query(
            `CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
        );

        await connection.end();
        console.log('✅  Database dropped & recreated successfully.');

        /* -------------------------------------------------- */
        /* 3. Re-sync Sequelize models (force=true)           */
        /* -------------------------------------------------- */
        console.log('🔄  Syncing Sequelize models (force: true)...');
        await dbModels.sequelize.sync({ force: true });
        console.log('✅  All tables created with UUID columns.');

        console.log('\n🎉  Database reset complete! You can now start the server normally.');
        process.exit(0);
    } catch (error) {
        console.error('❌  Failed to reset database:', error);
        process.exit(1);
    }
}

resetDatabase(); 