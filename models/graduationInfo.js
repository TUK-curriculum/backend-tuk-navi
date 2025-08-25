module.exports = (sequelize, DataTypes) => {
    const GraduationInfo = sequelize.define('GraduationInfo', {
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        total_credits: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },
        major_required: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },
        major_elective: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },
        general_required: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },
        general_elective: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },
        total_required: {
            type: DataTypes.SMALLINT,
            defaultValue: 130
        },
        progress_ratio: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0.00
        },
        remaining_credits: {
            type: DataTypes.SMALLINT,
            defaultValue: 130
        },
        extra: {
            type: DataTypes.JSON
        },
        diagnosis: {
            type: DataTypes.JSON
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'graduation_info',
        timestamps: false
    });

    return GraduationInfo;
}; 