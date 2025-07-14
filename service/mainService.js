// service/mainService.js
const { Curriculum, Lecture, sequelize } = require('../models');

module.exports = {
  async getDefaultCurriculum() {
    const cur = await Curriculum.findOne({
      where:{ isDefault:true },
      include:[{ model:Lecture, as:'lectures' }],
      order:[[ { model:Lecture, as:'lectures' },'semester','ASC']]
    });
    if (!cur) throw new Error('기본 커리큘럼이 없습니다.');
    return cur;
  },

  async createCurriculum(data) {
    return await sequelize.transaction(async t => {
      const { name, interestAreas=[], missingCourses=[], prerequisites=[] } = data;
      const cur = await Curriculum.create({ name,isDefault:false },{ transaction:t });
      const lectures = [];
      missingCourses.forEach((s,i)=> lectures.push({ curriculumId:cur.id, subjectId:s, semester:i+1 }));
      prerequisites.forEach((p,i)=> lectures.push({ curriculumId:cur.id, subjectId:p, semester:missingCourses.length+i+1 }));
      interestAreas.slice(0,3).forEach((a,i)=> lectures.push({ curriculumId:cur.id, subjectId:a.courseCode||`ELEC${100+i}`, semester: missingCourses.length+prerequisites.length+i+1 }));
      await Lecture.bulkCreate(lectures,{ transaction:t });
      return cur;
    });
  },

  async deleteCurriculum(curriculumId) {
    return await sequelize.transaction(async t => {
      await Lecture.destroy({ where:{ curriculumId },transaction:t });
      const cnt = await Curriculum.destroy({ where:{ id:curriculumId }, transaction:t });
      if (!cnt) throw new Error('커리큘럼이 없습니다.');
      return { message:'삭제 완료' };
    });
  },

  async updateLecture(lectureId, updates) {
    const lec = await Lecture.findByPk(lectureId);
    if (!lec) throw new Error('강의를 찾을 수 없습니다.');
    return await lec.update(updates);
  },

  async deleteLecture(lectureId) {
    const cnt = await Lecture.destroy({ where:{ id:lectureId }});
    if (!cnt) throw new Error('강의를 찾을 수 없습니다.');
    return { message:'삭제 완료' };
  },

  async moveLectureSemester(lectureId, newSemester) {
    const lec = await Lecture.findByPk(lectureId);
    if (!lec) throw new Error('강의를 찾을 수 없습니다.');
    return await lec.update({ semester:newSemester });
  },

  async getLectureInfo(curriculumId) {
    return await Lecture.findAll({
      where:{ curriculumId },
      order:[['semester','ASC']]
    });
  }
};
