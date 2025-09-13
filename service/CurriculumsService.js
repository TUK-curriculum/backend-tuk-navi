const { Curriculum, CurriculumLecture, Records, LectureCode, UserProfile } = require('../models');
const { mapRecordsToSemesters } = require('../utils/semester');
const { Op } = require('sequelize');

function determineStatus({ inputStatus, grade, semInGrade, currentGrade, currentSem, hasRecord, recordGrade }) {
  const sem = Number.isNaN(parseInt(semInGrade, 10))
    ? currentSem
    : parseInt(semInGrade, 10);

  if (grade === currentGrade && sem === currentSem && hasRecord) {
    return 'current';
  }

  if ((grade < currentGrade || (grade === currentGrade && sem < currentSem)) && !hasRecord) {
    return 'off-track';
  }

  if (hasRecord && (recordGrade === 'NP' || recordGrade === 'F')) {
    return 'off-track';
  }

  if (hasRecord) return 'completed';

  return 'planned';
}

function calculateRetakeCredits(originalGrade, newGrade, originalCredits) {
  const isFailOrNP = (grade) => grade === 'F' || grade === 'NP';

  if (isFailOrNP(originalGrade) && !isFailOrNP(newGrade)) {
    return originalCredits;
  }

  return 0;
}


const CurriculumsService = {
  /**
   * [GET] 사용자의 모든 커리큘럼 조회
   */
  async getCurriculums(userId, options = {}) {
    const { defaultOnly = false } = options;

    try {
      const where = { userId };
      if (defaultOnly) {
        where.isDefault = true;
      }
      
      const curriculums = await Curriculum.findAll({
        where,
        include: [{
          model: CurriculumLecture,
          as: 'lectures',
          required: false,
          include: [{ model: LectureCode, as: 'lectureCode', required: false }]
        }],
        order: [['created_at', 'DESC']]
      });

      const allCourseCodes = curriculums.flatMap(curri =>
        (curri.lectures || []).map(lec => lec.lectureCode?.code).filter(Boolean)
      );

      // 수강내역 조회
      const records = await Records.findAll({
        where: {
          userId,
          courseCode: { [Op.in]: allCourseCodes }
        }
      });

      const recordsMap = new Map();
      records.forEach(rec => {
        recordsMap.set(rec.courseCode, rec);
      });

      const curriculumsWithStats = curriculums.map(curriculum => {
        const lectures = (curriculum.lectures || []).map(lec => {
          return {
            ...lec.toJSON(),
            isCompleted: lec.status === 'completed',
            courseCode: lec.lectureCode?.code || null,
          };
        });

        const completedCount = lectures.filter(l => l.isCompleted).length;
        const completionRate = lectures.length > 0
          ? (completedCount / lectures.length) * 100
          : 0;

        return {
          ...curriculum.toJSON(),
          lectures,
          total_credits: curriculum.total_credits,
          totalLectures: lectures.length,
          completionRate
        };
      });

      return curriculumsWithStats;
    } catch (error) {
      console.error('Get curriculums service error:', error);
      throw new Error('커리큘럼 목록 조회에 실패했습니다.');
    }
  },

  /**
   * [GET] 특정 커리큘럼 상세 조회
   */
  async getCurriculumById(userId, curriculumId) {
    try {
      const curriculum = await Curriculum.findOne({
        where: { id: curriculumId, userId },
        include: [{
          model: CurriculumLecture,
          as: 'lectures',
          required: false,
          include: [{ model: LectureCode, as: 'lectureCode', required: false }]
        }]
      });

      if (!curriculum) {
        throw new Error('커리큘럼을 찾을 수 없습니다.');
      }

      const courseCodes = (curriculum.lectures || [])
        .map(lec => lec.lectureCode?.code)
        .filter(Boolean);

      const records = await Records.findAll({
        where: { userId, courseCode: { [Op.in]: courseCodes } }
      });

      const recordsMap = new Map();
      records.forEach(r => recordsMap.set(r.courseCode, r));

      const lectures = (curriculum.lectures || []).map(lec => {
        return {
          ...lec.toJSON(),
          isCompleted: lec.status === 'completed',
          courseCode: lec.lectureCode?.code || null,
        };
      });

      const completedCount = lectures.filter(l => l.isCompleted).length;
      const completionRate = lectures.length > 0
        ? (completedCount / lectures.length) * 100
        : 0;

      return {
        ...curriculum.toJSON(),
        lectures,
        total_credits: curriculum.total_credits,
        totalLectures: lectures.length,
        completionRate
      };
    } catch (error) {
      console.error('Get curriculum by id service error:', error);
      if (error.message.includes('찾을 수 없습니다')) {
        throw error;
      }
      throw new Error('커리큘럼 조회에 실패했습니다.');
    }
  },

  /**
   * [POST] 새 커리큘럼 생성
   */
  async createCurriculum(userId, data) {
    try {
      const { name, description, conditions, isDefault = false } = data;

      if (isDefault) {
        await Curriculum.update(
          { isDefault: false },
          { where: { userId, isDefault: true } }
        );
      }

      const curriculum = await Curriculum.create({
        userId,
        name,
        description,
        conditions: conditions || '',
        isDefault,
        total_credits: 0
      });

      const profile = await UserProfile.findOne({ where: { userId } });
      const enrollment_year = parseInt(profile?.enrollment_year, 10) || null;
      let currentGrade = profile?.grade || 1;
      let currentSem = profile?.semester || 1;

      // 수강내역
      const records = await Records.findAll({ where: { userId } });
      const lectureCodes = await LectureCode.findAll();
      const codeMap = new Map(lectureCodes.map(lc => [lc.code, lc]));

      // 입학년도 반영
      const mapped = mapRecordsToSemesters(records, enrollment_year);

      for (const { record, grade, semInGrade } of mapped) {
        const lc = codeMap.get(record.courseCode);
        if (!lc) continue;

        // 현재 학기 이전 과목이거나, 현재 학기면서 수강내역이 존재하는 경우 추가
        if (
          grade < currentGrade ||
          (grade === currentGrade && semInGrade < currentSem) ||
          (grade === currentGrade && semInGrade === currentSem && record)
        ) {

          const hasRecord = !!record;
          const status = determineStatus({
            inputStatus: null,
            grade,
            semInGrade,
            currentGrade,
            currentSem,
            hasRecord,
            recordGrade: record ? record.grade : null
          });

          const [lec, created] = await CurriculumLecture.findOrCreate({
            where: { curri_id: curriculum.id, lect_id: lc.id },
            defaults: {
              curri_id: curriculum.id,
              lect_id: lc.id,
              name: lc.name,
              credits: lc.credits,
              semester: semInGrade ? String(semInGrade) : String(currentSem),
              grade: grade,
              status: status,
              type: lc.type
            }
          });
          
          if (!created && lec.status !== status) {
            await lec.update({ status });
          }
        }
      }

      await this.updateCurriculumTotalCredits(curriculum.id);

      const recordsMap = new Map(records.map(r => [r.courseCode, r]));

      const createdCurriculum = await Curriculum.findByPk(curriculum.id, {
        include: [{
          model: CurriculumLecture,
          as: 'lectures',
          include: [{ model: LectureCode, as: 'lectureCode' }]
        }]
      });

      const lectures = (createdCurriculum.lectures || []).map(lec => {
        const isCompleted = lec.status === 'completed';

        return {
          ...lec.toJSON(),
          isCompleted
        };
      });

      const totalLectures = lectures.length;
      const completedCount = lectures.filter(l => l.isCompleted).length;
      const completionRate = totalLectures > 0 ? (completedCount / totalLectures) * 100 : 0;

      return {
        ...createdCurriculum.toJSON(),
        lectures,
        totalLectures,
        total_credits: createdCurriculum.total_credits || 0,
        completionRate
      };
    } catch (error) {
      console.error('Create curriculum service error:', error);
      throw new Error('커리큘럼 생성에 실패했습니다.');
    }
  },

  /**
   * [PUT] 커리큘럼 수정
   */
  async updateCurriculum(userId, curriculumId, updateData) {
    try {
      const curriculum = await Curriculum.findOne({
        where: { 
          id: curriculumId,
          userId 
        }
      });

      if (!curriculum) {
        throw new Error('커리큘럼을 찾을 수 없습니다.');
      }

      // 기본 커리큘럼 처리
      if (updateData.isDefault === true) {
        await Curriculum.update(
          { isDefault: false },
          { where: { userId, isDefault: true, id: { [Op.ne]: curriculumId } } }
        );
      }

      await curriculum.update(updateData);

      const updatedCurriculum = await Curriculum.findByPk(curriculumId, {
        include: [{
          model: CurriculumLecture,
          as: 'lectures',
          required: false
        }]
      });

      const lectures = (updatedCurriculum.lectures || []).map(lec => {
        return {
          ...lec.toJSON(),
          isCompleted: lec.status === 'completed'
        };
      });

      const totalLectures = lectures.length;
      const completedCount = lectures.filter(l => l.isCompleted).length;
      const completionRate = totalLectures > 0 ? (completedCount / totalLectures) * 100 : 0;

      return {
        ...updatedCurriculum.toJSON(),
        total_credits: curriculum.total_credits,
        totalLectures,
        completionRate
      };
      
    } catch (error) {
      console.error('Update curriculum service error:', error);
      if (error.message.includes('찾을 수 없습니다')) {
        throw error;
      }
      throw new Error('커리큘럼 수정에 실패했습니다.');
    }
  },

  /**
   * [DELETE] 커리큘럼 삭제
   */
  async deleteCurriculum(userId, curriculumId) {
    try {
      const curriculum = await Curriculum.findOne({
        where: { 
          id: curriculumId,
          userId 
        }
      });

      if (!curriculum) {
        throw new Error('커리큘럼을 찾을 수 없습니다.');
      }

      // 커리큘럼 강의 삭제
      await CurriculumLecture.destroy({
        where: { curri_id: curriculumId }
      });

      // 커리큘럼 삭제
      await curriculum.destroy();

      return { message: '커리큘럼이 삭제되었습니다.' };
    } catch (error) {
      console.error('Delete curriculum service error:', error);
      if (error.message.includes('찾을 수 없습니다')) {
        throw error;
      }
      throw new Error('커리큘럼 삭제에 실패했습니다.');
    }
  },

  /**
   * [GET] 기본 커리큘럼 조회
   */
  async getDefaultCurriculum(userId) {
    try {
      const curriculum = await Curriculum.findOne({
        where: { 
          userId,
          isDefault: true 
        },
        include: [{
          model: CurriculumLecture,
          as: 'lectures',
          required: false
        }]
      });

      if (!curriculum) {
          // 기본 커리큘럼이 없으면 첫 번째 커리큘럼을 반환
          const firstCurriculum = await Curriculum.findOne({
              where: { userId },
              include: [{
                  model: CurriculumLecture,
                  as: 'lectures',
                  required: false
              }],
              order: [['created_at', 'ASC']]
          });

          if (!firstCurriculum) {
              return null;
          }

          const lectures = firstCurriculum.lectures || [];

          return {
              ...firstCurriculum.toJSON(),
              total_credits: firstCurriculum.total_credits,
              totalLectures: lectures.length
          };
      }

      const lectures = curriculum.lectures || [];

      return {
        ...curriculum.toJSON(),
        total_credits: curriculum.total_credits,
        totalLectures: lectures.length
      };
    } catch (error) {
      console.error('Get default curriculum service error:', error);
      throw new Error('기본 커리큘럼 조회에 실패했습니다.');
    }
  },

  /**
   * [POST] 기본 커리큘럼 설정
   */
  async setDefaultCurriculum(userId, curriculumId) {
    try {
      const curriculum = await Curriculum.findOne({
        where: { id: curriculumId, userId }
      });

      if (!curriculum) {
        throw new Error('해당 커리큘럼을 찾을 수 없습니다.');
      }

      // 기존 기본 커리큘럼 해제
      await Curriculum.update(
        { isDefault: false },
        { where: { userId, isDefault: true } }
      );

      // 새로운 기본 커리큘럼 설정
      await curriculum.update({ isDefault: true });

      return { 
        message: '기본 커리큘럼이 설정되었습니다.', 
        curriculumId,
        name: curriculum.name
      };
    } catch (error) {
      console.error('Set default curriculum service error:', error);
      if (error.message.includes('찾을 수 없습니다')) {
        throw error;
      }
      throw new Error('기본 커리큘럼 설정에 실패했습니다.');
    }
  },

  /**
   * [POST] 커리큘럼에 과목 추가
   */
  async addLecture(userId, curriculumId, data) {
    try {
      const curriculum = await Curriculum.findOne({
        where: { id: curriculumId, userId }
      });
      if (!curriculum) {
        throw new Error('커리큘럼을 찾을 수 없습니다.');
      }

      let lect_id = null;
      let isRetaken = false;

      // 강의코드 매핑
      if (data.courseCode) {
        const lectureCode = await LectureCode.findOne({
          where: { code: data.courseCode.trim() }
        });

        if (lectureCode) {
          lect_id = lectureCode.id;
          if (!data.name) data.name = lectureCode.name;
          if (!data.credits) data.credits = lectureCode.credits;
          if (!data.type) data.type = lectureCode.type;
        }

        // 수강내역 존재 여부 확인
        if (data.status === 'completed' && data.courseCode) {
          const existingRecord = await Records.findOne({
            where: { 
              userId, 
              courseCode: data.courseCode 
            }
          });

          if (existingRecord) {
            throw new Error(`DUPLICATE_RECORD:${data.courseCode}:${data.name}`);
          }
        }

        // 재수강 여부 확인
        const existingLectures = await CurriculumLecture.findAll({
          where: { curri_id: curriculumId },
          include: [{ model: LectureCode, as: 'lectureCode' }]
        });

        const sameCodeCount = existingLectures.filter(
          lec => lec.lectureCode?.code === data.courseCode
        ).length;

        isRetaken = sameCodeCount > 0;
      }

      const profile = await UserProfile.findOne({ where: { userId } });
      const currentGrade = profile?.grade || 1;
      const currentSem = profile?.semester || 1;

      // 수강내역 존재 여부 확인
      let hasRecord = false;
      if (data.courseCode) {
        const rec = await Records.findOne({ where: { userId, courseCode: data.courseCode } });
        hasRecord = !!rec;
      }

      let status;
      if (data.status === 'completed' || data.status === 'current') {
        status = data.status;
      } else {
        status = determineStatus({
          inputStatus: null,
          grade: data.grade,
          semInGrade: data.semester,
          currentGrade,
          currentSem,
          hasRecord,
          recordGrade: data.recordGrade
        });
      }

      const lecture = await CurriculumLecture.create({
        curri_id: curriculumId,
        lect_id,
        name: data.name,
        credits: data.credits || 0,
        semester: data.semester,
        grade: data.grade || 1,
        type: data.type || 'GE',
        status,
        isRetaken: data.forceRetaken || isRetaken
      });

      if (lecture.status !== status) {
        await lecture.update({ status });
      }

      if ((status === 'completed' || status === 'current') && data.courseCode) {
      let creditsToSave = data.credits || 0;

      const prevRecord = await Records.findOne({
        where: { userId, courseCode: data.courseCode }
      });

      if (prevRecord) {
        creditsToSave = calculateRetakeCredits(
          prevRecord.grade,
          data.recordGrade,
          prevRecord.credits
        );
      }

      await Records.create({
        userId,
        courseCode: data.courseCode,
        courseName: data.name,
        credits: creditsToSave,
        grade: data.recordGrade || null,
        semester: data.semester,
        type: data.type || 'GE',
      });
    }

      await this.updateCurriculumTotalCredits(curriculumId);

      return lecture;
    } catch (error) {
      console.error('Add lecture service error:', error);
      
      if (error.message.startsWith('DUPLICATE_RECORD:')) {
        throw error;
      }
      
      if (error.message.includes('찾을 수 없습니다') || error.message.includes('이미 존재합니다')) {
        throw error;
      }
      throw new Error('강의 추가에 실패했습니다.');
    }
  },

  /**
   * [PUT] 강의 수정 
   */
  async updateLecture(userId, curriculumId, lectureId, updateData) {
    try {
      // 커리큘럼 소유권 확인
      const curriculum = await Curriculum.findOne({
        where: { 
          id: curriculumId,
          userId 
        }
      });

      if (!curriculum) {
        throw new Error('커리큘럼을 찾을 수 없습니다.');
      }

      const lecture = await CurriculumLecture.findOne({
        where: { 
          id: lectureId,
          curri_id: curriculumId 
        },
        include: [{ model: LectureCode, as: 'lectureCode' }]
      });

      if (!lecture) {
        throw new Error('강의를 찾을 수 없습니다.');
      }

      const profile = await UserProfile.findOne({ where: { userId } });
      const currentGrade = profile?.grade || 1;
      const currentSem = profile?.semester || 1;

      let hasRecord = false;
      if (lecture.lectureCode?.code) {
        const rec = await Records.findOne({ where: { userId, courseCode: lecture.lectureCode.code } });
        hasRecord = !!rec;
      }

      let status;
      if (updateData.status === 'completed' || updateData.status === 'current') {
        status = updateData.status;
      } else {
        status = determineStatus({
          inputStatus: null,
          grade: updateData.grade,
          semInGrade: updateData.semester,
          currentGrade,
          currentSem,
          hasRecord,
          recordGrade: updateData.recordGrade
        });
      }

      if ((status === 'completed' || status === 'current') && lecture.lectureCode?.code) {
        const existingRecord = await Records.findOne({
          where: { userId, courseCode: lecture.lectureCode.code }
        });

        if (!existingRecord) {
          let creditsToSave = updateData.credits || lecture.credits;

          if (updateData.forceRetaken || lecture.isRetaken) {
            creditsToSave = calculateRetakeCredits(
              null,
              updateData.recordGrade,
              creditsToSave
            );
          }

          await Records.create({
            userId,
            courseCode: lecture.lectureCode.code,
            courseName: updateData.name || lecture.name,
            credits: creditsToSave,
            grade: updateData.recordGrade,
            semester: updateData.semester || lecture.semester,
            type: updateData.type || lecture.type || 'GE',
          });
        } else {
          let creditsToSave = updateData.credits || existingRecord.credits;

          if (updateData.forceRetaken || lecture.isRetaken) {
            creditsToSave = calculateRetakeCredits(
              existingRecord.grade,
              updateData.recordGrade,
              updateData.credits || existingRecord.credits
            );
          }

          await existingRecord.update({
            name: updateData.name || lecture.name,
            credits: creditsToSave,
            type: updateData.type || lecture.type || 'GE',
            grade: updateData.recordGrade || existingRecord.grade
          });
        }
      }

      await lecture.update({ ...updateData, status, semester: lecture.semester });
      await this.updateCurriculumTotalCredits(curriculumId);

      return lecture;
    } catch (error) {
      console.error('Update lecture service error:', error);
      
      // 중복 기록 에러는 그대로 전달
      if (error.message.startsWith('DUPLICATE_RECORD:')) {
        throw error;
      }
      
      if (error.message.includes('찾을 수 없습니다')) {
        throw error;
      }
      throw new Error('강의 수정에 실패했습니다.');
    }
  },

  /**
   * [DELETE] 강의 삭제
   */
  async deleteLecture(userId, curriculumId, lectureId) {
    try {
      // 커리큘럼 소유권 확인
      const curriculum = await Curriculum.findOne({
        where: { 
          id: curriculumId,
          userId 
        }
      });

      if (!curriculum) {
        throw new Error('커리큘럼을 찾을 수 없습니다.');
      }

      const deletedCount = await CurriculumLecture.destroy({
        where: { 
          id: lectureId,
          curri_id: curriculumId 
        }
      });

      if (deletedCount === 0) {
        throw new Error('강의를 찾을 수 없습니다.');
      }

      // 커리큘럼의 total_credits 업데이트
      await this.updateCurriculumTotalCredits(curriculumId);

      return { message: '강의가 삭제되었습니다.' };
    } catch (error) {
      console.error('Delete lecture service error:', error);
      if (error.message.includes('찾을 수 없습니다')) {
        throw error;
      }
      throw new Error('강의 삭제에 실패했습니다.');
    }
  },

  /**
   * 커리큘럼의 총 학점 업데이트
   */
  async updateCurriculumTotalCredits(curriculumId) {
    try {
      const lectures = await CurriculumLecture.findAll({
        where: { curri_id: curriculumId }
      });

      const totalCredits = lectures.reduce((sum, lecture) => sum + (lecture.credits || 0), 0);

      await Curriculum.update(
        { total_credits: totalCredits },
        { where: { id: curriculumId } }
      );

      return totalCredits;
    } catch (error) {
      console.error('Update curriculum total credits error:', error);
      throw new Error('커리큘럼 총 학점 업데이트에 실패했습니다.');
    }
  },

  /**
   * [POST] 의견 등록 (기존)
   */
  async addOpinion(curriculumId, data) {
    const id = parseInt(curriculumId, 10);
    if (Number.isNaN(id) || !data || !data.opinion) {
      throw new Error('유효한 curri_id와 opinion이 필요합니다.');
    }
    return { message: '의견이 저장되었습니다.', curri_id: id, opinion: data.opinion };
  }
};

module.exports = CurriculumsService;