const { Op } = require('sequelize');
const { PreferredProfessor, Professor, Lecture, Major, CourseCode, sequelize } = require('../models');

class ProfessorService {
  // 사용자 선호교수 목록 조회
  async getUserPreferredProfessors(userId) {
    try {
      const preferred = await PreferredProfessor.findAll({
        where: { user_id: userId },
        attributes: [
          'id',
          'professor_id',
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('Professor->Lectures.id'))), 'lecture_count']
        ],
        include: [
          {
            model: Professor,
            attributes: ['id', 'name', 'email', 'office', 'position', 'research_area'],
            include: [
              { model: Major, attributes: ['name'] },
              { model: Lecture, attributes: [] }
            ]
          }
        ],
        group: [
          'PreferredProfessor.id',
          'Professor.id',
          'Professor->Major.id'
        ],
        order: [[{ model: Professor }, 'name', 'ASC']]
      });

      return preferred.map(p => ({
        preferred_id: p.id,
        professor_id: p.professor_id,
        name: p.Professor?.name || '',
        email: p.Professor?.email || '',
        office: p.Professor?.office || '',
        position: p.Professor?.position || '',
        research_area: p.Professor?.research_area || '',
        major_name: p.Professor?.Major?.name || '',
        lecture_count: p.get('lecture_count') || 0
      }));
    } catch (error) {
      throw new Error(`선호교수 목록 조회 실패: ${error.message}`);
    }
  }

  // 선호교수 추가
  async addPreferredProfessor(userId, professorId) {
    try {
      const [record, created] = await PreferredProfessor.findOrCreate({
        where: { user_id: userId, professor_id: professorId },
        defaults: { user_id: userId, professor_id: professorId }
      });
      if (!created) throw new Error('이미 등록된 교수입니다.');
      return record;
    } catch (error) {
      throw new Error(`선호교수 추가 실패: ${error.message}`);
    }
  }

  // 교수 목록 조회
  async getProfessors(search = '') {
    return Professor.findAll({
      where: search ? { name: { [Op.like]: `%${search}%` } } : {},
      include: [{ model: Major, attributes: ['name'] }],
      order: [['name', 'ASC']]
    });
  }

  // 교수 강의 조회
  async getProfessorLectures(professorId) {
    return Lecture.findAll({
      where: { prof_id: professorId },
      include: [{ model: CourseCode, attributes: ['name', 'type', 'credit'] }],
      order: [['year', 'DESC'], ['semester'], ['grade']]
    });
  }

  // 선호교수 삭제
  async removePreferredProfessor(userId, preferredId) {
    try {
      const deleted = await PreferredProfessor.destroy({
        where: { id: preferredId, user_id: userId }
      });
      if (!deleted) throw new Error('삭제할 선호교수가 없습니다.');
      return { success: true };
    } catch (error) {
      throw new Error(`선호교수 삭제 실패: ${error.message}`);
    }
  }
}

module.exports = new ProfessorService();