module.exports = (sequelize, DataTypes) => {
    const Course = sequelize.define('Course', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING(120),
            allowNull: false
        },
        category: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        type: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        credits: {
            type: DataTypes.SMALLINT,
            allowNull: false
        },
        year: {
            type: DataTypes.SMALLINT
        },
        semester: {
            type: DataTypes.SMALLINT
        },
        description: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'courses',
        timestamps: false
    });

    return Course;
}; 