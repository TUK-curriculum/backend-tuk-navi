// models/userProfile.js
module.exports = (sequelize, DataTypes) => {
    const UserProfile = sequelize.define('UserProfile', {
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false,
            references: {
            model: 'users',
            key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        student_id: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        major: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        grade: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            defaultValue: 1
        },
        semester: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            defaultValue: 1
        },
        onboarding_completed: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        interests: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
            const value = this.getDataValue('interests');
            return value ? JSON.parse(value) : [];
            },
            set(value) {
            this.setDataValue('interests', JSON.stringify(value));
            }
        },
        completed_credits: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            defaultValue: 0
        },
        career: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        industry: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        remaining_semesters: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            defaultValue: 0
        },
        max_credits_per_term: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            defaultValue: 18
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        enrollment_year: {
            type: DataTypes.SMALLINT,
            allowNull: true
        },
        graduation_year: {
            type: DataTypes.SMALLINT,
            allowNull: true
        }
        }, {
            tableName: 'user_profiles',
            timestamps: false
        });

    return UserProfile;
}; 