// models/curriculum.js
module.exports = (sequelize, DataTypes) => {
    const Curriculum = sequelize.define('Curriculum', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'userId',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'updated_at'
        },
        total_credits: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            field: 'total_credits'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isDefault: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_default'
        },
        conditions: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
      }, {
        tableName: 'curriculums',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: false,
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['created_at']
            }
        ]   
    });

    return Curriculum;
};