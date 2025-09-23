const { GraduationRequirement } = require('../models');

class GraduationRequirementService {
  // 전체 조회
  static async getAllRequirements() {
    const requirements = await GraduationRequirement.findAll({
      order: [['entry_year_start', 'ASC']]
    });

    return requirements.map(req => {
      // 학번 구간 문자열 생성
      const yearRange = req.entry_year_end
        ? `${req.entry_year_start} ~ ${req.entry_year_end}`
        : `${req.entry_year_start} ~`;

      return {
        id: req.id,
        yearRange,
        entry_year_start: req.entry_year_start,
        entry_year_end: req.entry_year_end,
        total_credits: req.total_credits,
        liberal_arts: req.liberal_arts,
        major: req.major,
        created_at: req.created_at,
        updated_at: req.updated_at,
      };
    });
  }

  // 생성
  static async createRequirement(data) {
    return await GraduationRequirement.create({
      entry_year_start: data.entry_year_start,
      entry_year_end: data.entry_year_end ?? null,
      total_credits: data.total_credits,
      liberal_arts: data.liberal_arts,
      major: data.major,
    });
  }

  // 업데이트
  static async updateRequirement(id, data) {
    const requirement = await GraduationRequirement.findByPk(id);
    if (!requirement) throw new Error('졸업 요건을 찾을 수 없습니다.');

    await requirement.update({
      entry_year_start: data.entry_year_start ?? requirement.entry_year_start,
      entry_year_end: data.entry_year_end ?? requirement.entry_year_end,
      total_credits: data.total_credits ?? requirement.total_credits,
      liberal_arts: data.liberal_arts ?? requirement.liberal_arts,
      major: data.major ?? requirement.major,
    });

    return requirement;
  }

  // 삭제
  static async deleteRequirement(id) {
    const requirement = await GraduationRequirement.findByPk(id);
    if (!requirement) throw new Error('졸업 요건을 찾을 수 없습니다.');

    await requirement.destroy();
    return true;
  }
}

module.exports = GraduationRequirementService;