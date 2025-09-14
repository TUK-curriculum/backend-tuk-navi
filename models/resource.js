module.exports = (sequelize, DataTypes) => {
    const Resource = sequelize.define('Resource', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        courseId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: { model: 'courses', key: 'id' },
            onDelete: 'CASCADE'
        },
            uploaderId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        },
            title: {
            type: DataTypes.STRING,
            allowNull: false
        },
            fileUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
            description: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'resources',
        timestamps: true
    });
    
    return Resource;
};
