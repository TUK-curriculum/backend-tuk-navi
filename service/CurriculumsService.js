'use strict';

const { Curriculum, CurriculumLecture, sequelize } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  /**
   * [GET] 내 커리큘럼 전체 조회
   */
  async getCurriculums(userId) {
    return await Curriculum.findAll({
      where: { userId },
      include: [{ model: CurriculumLecture, as: 'lectures' }],
      order: [[{ model: CurriculumLecture, as: 'lectures' }, 'semester', 'ASC']],
    });
  },

  /**
   * [GET] 특정 커리큘럼 상세 조회
   */
  async getCurriculumById(userId, curriculumId) {
    const id = parseInt(curriculumId, 10);
    if (Number.isNaN(id)) {
      throw new Error('유효하지 않은 커리큘럼 ID입니다.');
    }
    const curriculum = await Curriculum.findOne({
      where: { id, userId },
      include: [{ model: CurriculumLecture, as: 'lectures', order: [['semester', 'ASC']] }],
    });
    if (!curriculum) {
      throw new Error('해당 커리큘럼을 찾을 수 없습니다.');
    }
    return curriculum;
  },

  /**
   * [DELETE] 커리큘럼 삭제
   */
  async deleteCurriculum(userId, curriculumId) {
    return await sequelize.transaction(async (t) => {
      const id = parseInt(curriculumId, 10);
      if (Number.isNaN(id)) throw new Error('유효하지 않은 커리큘럼 ID입니다.');

      const curriculum = await Curriculum.findOne({ where: { id, userId }, transaction: t });
      if (!curriculum) throw new Error('해당 커리큘럼을 찾을 수 없습니다.');

      await CurriculumLecture.destroy({ where: { curri_id: id }, transaction: t });
      await curriculum.destroy({ transaction: t });
      return { message: '커리큘럼이 삭제되었습니다.' };
    });
  },

  /**
   * [POST] 기본 커리큘럼 설정
   */
  async setDefaultCurriculum(userId, data) {
    if (!data || !data.name) {
      throw new Error('커리큘럼 이름(name)이 필요합니다.');
    }
    return await sequelize.transaction(async (t) => {
      await Curriculum.update(
        { isDefault: false },
        { where: { userId }, transaction: t }
      );
      const newDefault = await Curriculum.create(
        { name: data.name, isDefault: true, userId },
        { transaction: t }
      );
      return {
        message: '기본 커리큘럼이 설정되었습니다.',
        curriculum: newDefault,
      };
    });
  },

  /**
   * [GET] 기본 커리큘럼 조회 (없으면 생성)
   */
  async getDefaultCurriculum(userId) {
    let curriculum = await Curriculum.findOne({
      where: { isDefault: true, userId },
      include: [{ model: CurriculumLecture, as: 'lectures', order: [['semester', 'ASC']] }],
    });
    if (!curriculum) {
      curriculum = await sequelize.transaction(async (t) =>
        Curriculum.create({ name: '기본 커리큘럼', isDefault: true, userId }, { transaction: t })
      );
    }
    return curriculum;
  },

  /**
   * [POST] 과목 추가 (시간 중복 검사 포함)
   */
  async addLecture(curriculumId, data) {
    const id = parseInt(curriculumId, 10);
    if (Number.isNaN(id)) throw new Error('유효하지 않은 커리큘럼 ID입니다.');

    const curriculum = await Curriculum.findByPk(id);
    if (!curriculum) throw new Error('해당 커리큘럼을 찾을 수 없습니다.');

    const { courseName, dayOfWeek, startTime, endTime, semester } = data;
    if (!courseName || !dayOfWeek || !startTime || !endTime || Number.isNaN(parseInt(semester, 10))) {
      throw new Error('courseName, dayOfWeek, startTime, endTime, semester 모두 필요합니다.');
    }

    const conflictLecture = await CurriculumLecture.findOne({
      where: {
        curri_id: id,
        dayOfWeek,
        [Op.or]: [
          { startTime: { [Op.between]: [startTime, endTime] } },
          { endTime: { [Op.between]: [startTime, endTime] } },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: startTime } },
              { endTime: { [Op.gte]: endTime } },
            ],
          },
        ],
      },
    });

    if (conflictLecture) {
      throw new Error('이미 같은 시간대에 다른 강의가 존재합니다.');
    }

    const curriculum_lecture = await CurriculumLecture.create({
      curri_id: id,
      courseName,
      dayOfWeek,
      startTime,
      endTime,
      semester: parseInt(semester, 10),
    });

    return curriculum_lecture;
  },

  /**
   * [PUT] 과목 수정
   */
  async updateLectureOrder(curriculumId, lectureId, data) {
    const curId = parseInt(curriculumId, 10);
    const lectId = parseInt(lectureId, 10);
    if (Number.isNaN(curId) || Number.isNaN(lectId)) {
      throw new Error('유효하지 않은 ID입니다.');
    }

    const curriculum_lecture = await CurriculumLecture.findOne({
      where: { id: lectId, curri_id: curId },
    });
    if (!curriculum_lecture) throw new Error('해당 과목을 찾을 수 없습니다.');

    const updates = {};
    if (data.courseName) updates.courseName = data.courseName;
    if (data.dayOfWeek) updates.dayOfWeek = data.dayOfWeek;
    if (data.startTime) updates.startTime = data.startTime;
    if (data.endTime) updates.endTime = data.endTime;
    if (!Number.isNaN(parseInt(data.semester, 10))) {
      updates.semester = parseInt(data.semester, 10);
    }
    return await curriculum_lecture.update(updates);
  },

  /**
 * [PUT] 과목 순서 일괄 수정
 */
async reorderLectures(curriculumId, reorderData) {
  const id = parseInt(curriculumId, 10);
  if (Number.isNaN(id)) throw new Error('유효하지 않은 커리큘럼 ID입니다.');

  const promises = reorderData.map(item =>
    CurriculumLecture.update(
      { order: item.order },
      { where: { id: item.lectureId, curri_id: id } }
    )
  );

  await Promise.all(promises);

  return { message: '과목 순서가 수정되었습니다.' };
},

  /**
   * [DELETE] 특정 과목 삭제
   */
  async deleteLecture(curriculumId, lectureId) {
    const curId = parseInt(curriculumId, 10);
    const lectId = parseInt(lectureId, 10);
    if (Number.isNaN(curId) || Number.isNaN(lectId)) {
      throw new Error('유효하지 않은 ID입니다.');
    }

    const deleted = await CurriculumLecture.destroy({ where: { id: lectId, curri_id: curId } });
    if (!deleted) throw new Error('해당 과목이 없습니다.');
    return { message: '과목이 삭제되었습니다.' };
  },

  /**
   * [POST] 새 커리큘럼 생성
   */
  async createCurriculum(userId, data) {
    if (!data || !data.name) {
      throw new Error('커리큘럼 이름(name)이 필요합니다.');
    }
    const curriculum = await Curriculum.create({
      name: data.name,
      isDefault: data.isDefault === true,
      userId: userId, // ✨ userId 반드시 저장
    });
    return curriculum;
  },

  /**
   * [POST] 의견 등록 (추후 연동 예정)
   */
  async addOpinion(curriculumId, data) {
    const id = parseInt(curriculumId, 10);
    if (Number.isNaN(id) || !data || !data.opinion) {
      throw new Error('유효한 curri_id와 opinion이 필요합니다.');
    }
    return { message: '의견이 저장되었습니다.', curri_id: id, opinion: data.opinion };
  },
};
