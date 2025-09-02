module.exports = (sequelize, DataTypes) => {
    const Note = sequelize.define('Note', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(120)
        },
        content: {
            type: DataTypes.TEXT
        },
        category: {
            type: DataTypes.STRING(40)
        },
        tags: {
            type: DataTypes.JSON
        },
        isPinned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_pinned'
        },
        isArchived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_archived'
        },
        order: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        }
    }, {
        tableName: 'notes',
        underscored: true
    });

    return Note;
}; 