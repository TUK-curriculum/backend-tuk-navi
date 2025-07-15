// fix-database.js
require('dotenv').config();
const sequelize = require('./config/database');

async function fixDatabase() {
    try {
        console.log('🔧 Starting database schema fix...');

        // Disable foreign key checks
        console.log('🔒 Disabling foreign key checks...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Get all table names
        console.log('📋 Getting all table names...');
        const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
    `);

        // Drop each table
        console.log('🗑️  Dropping all existing tables...');
        for (const table of tables) {
            const tableName = table.table_name;
            if (tableName) {
                console.log(`Dropping table: ${tableName}`);
                try {
                    await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
                } catch (error) {
                    console.log(`Warning: Could not drop table ${tableName}:`, error.message);
                }
            }
        }

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ All tables dropped successfully');

        // Sync all models to recreate tables with correct schema
        console.log('🔄 Recreating tables with correct schema...');
        const db = require('./models');

        // Force sync all models
        await sequelize.sync({ force: true });

        console.log('✅ Database schema fixed successfully!');
        console.log('📊 All tables recreated with proper UUID types');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing database:', error);
        process.exit(1);
    }
}

fixDatabase();
require('dotenv').config();
const sequelize = require('./config/database');

async function fixDatabase() {
    try {
        console.log('🔧 Starting database schema fix...');

        // Disable foreign key checks
        console.log('🔒 Disabling foreign key checks...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Get all table names
        console.log('📋 Getting all table names...');
        const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      AND table_type = 'BASE TABLE'
    `);

        // Drop each table
        console.log('🗑️  Dropping all existing tables...');
        for (const table of tables) {
            const tableName = table.table_name;
            if (tableName) {
                console.log(`Dropping table: ${tableName}`);
                try {
                    await sequelize.query(`DROP TABLE IF EXISTS \`${tableName}\``);
                } catch (error) {
                    console.log(`Warning: Could not drop table ${tableName}:`, error.message);
                }
            }
        }

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✅ All tables dropped successfully');

        // Sync all models to recreate tables with correct schema
        console.log('🔄 Recreating tables with correct schema...');
        const db = require('./models');

        // Force sync all models
        await sequelize.sync({ force: true });

        console.log('✅ Database schema fixed successfully!');
        console.log('📊 All tables recreated with proper UUID types');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing database:', error);
        process.exit(1);
    }
}

fixDatabase(); 