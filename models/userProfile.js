// models/userProfile.js
module.exports = (sequelize, DataTypes) => {
    const UserProfile = sequelize.define('UserProfile', {
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        student_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        major: {
            type: DataTypes.STRING,
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        grade: {
            type: DataTypes.SMALLINT,
            defaultValue: 1
        },
        semester: {
            type: DataTypes.SMALLINT,
            defaultValue: 1
        },
        onboarding_completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        interests: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        completed_credits: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },
        career: {
            type: DataTypes.STRING,
            allowNull: true
        },
        industry: {
            type: DataTypes.STRING,
            allowNull: true
        },
        remaining_semesters: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },
        max_credits_per_term: {
            type: DataTypes.SMALLINT,
            defaultValue: 18
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'user_profiles',
        timestamps: false
    });

    return UserProfile;
}; 