module.exports = (sequelize, DataTypes) => {
    const ReviewFile = sequelize.define('ReviewFile', {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true
            },
            reviewId: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'reviews', key: 'id' },
                onDelete: 'CASCADE'
            },
            fileName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            fileUrl: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
            tableName: 'review_files',
            timestamps: true
        });
        
    return ReviewFile;
};