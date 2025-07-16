module.exports = (sequelize, DataTypes) => {
    const Note = sequelize.define('Note', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id'
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
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'notes',
        underscored: true
    });

    Note.associate = models => {
        Note.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
    };

    return Note;
}; 