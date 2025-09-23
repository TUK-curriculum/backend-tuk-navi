module.exports = (sequelize, DataTypes) => {
    const GraduationRequirement = sequelize.define('GraduationRequirement', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        entry_year_start: {
            type: DataTypes.SMALLINT.UNSIGNED,
            allowNull: false,
        },
        entry_year_end: {
            type: DataTypes.SMALLINT.UNSIGNED,
            allowNull: true,
        },
        total_credits: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        liberal_arts: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        major: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    }, {
        tableName: 'graduation_requirement',
        timestamps: false
    });

    return GraduationRequirement;
};