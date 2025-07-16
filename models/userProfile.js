// models/userProfile.js
module.exports = (sequelize, DataTypes) => {
    const UserProfile = sequelize.define('UserProfile', {
        user_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
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