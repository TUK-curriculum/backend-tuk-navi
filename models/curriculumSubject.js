module.exports = (sequelize, DataTypes) => {
    const CurriculumSubject = sequelize.define('CurriculumSubject', {
        curriculumUserId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            field: 'curriculum_user_id'
        },
        courseId: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            allowNull: false,
            field: 'course_id'
        },
        isCompleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_completed'
        }
    }, {
        tableName: 'curriculum_subjects',
        underscored: true,
        timestamps: false
    });

    CurriculumSubject.associate = models => {
        CurriculumSubject.belongsTo(models.Curriculum, { foreignKey: 'curriculumUserId', targetKey: 'id', onDelete: 'CASCADE' });
        CurriculumSubject.belongsTo(models.Course, { foreignKey: 'courseId', onDelete: 'CASCADE' });
    };

    return CurriculumSubject;
}; 