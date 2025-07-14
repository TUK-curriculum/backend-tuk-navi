// service/graduationService.js
'use strict';

const { Records, Certificate, RequiredCourse } = require('../models');
const { Op } = require('sequelize');

const THRESHOLDS = {
  totalCredits: 140,
  liberalArts:   42,
  majorCredits:  75,
  practicalCount:1
};

// Helper: 평점 패스 간주
function isPassedGrade(grade) {
  const failSet = new Set(['F','U','미이수']);
  return !failSet.has(grade);
}

module.exports = {
  /** 총·교양·전공 학점 비교 */
  async getGraduationPass(userId) {
    const recs = await Records.findAll({ where: { userId, grade: { [Op.ne]: null } } });

    let total=0, lib=0, major=0, practical=0;
    recs.forEach(r => {
      if (!isPassedGrade(r.grade)) return;
      total += r.credits;
      if (r.type === 'general') lib += r.credits;
      if (r.type === 'major')   major += r.credits;
      if (r.type === 'practical') practical++;
    });

    return {
      total:    { passed: total >= THRESHOLDS.totalCredits,    actual: total, threshold: THRESHOLDS.totalCredits },
      liberal:  { passed: lib   >= THRESHOLDS.liberalArts,     actual: lib,   threshold: THRESHOLDS.liberalArts },
      major:    { passed: major >= THRESHOLDS.majorCredits,    actual: major, threshold: THRESHOLDS.majorCredits },
      practical:{ passed: practical >= THRESHOLDS.practicalCount, actual: practical, threshold: THRESHOLDS.practicalCount }
    };
  },

  /** 미이수 필수과목 조회 */
  async getRequiredMissing(userId) {
    // DB에 저장된 졸업필수교과목 전체
    const required = await RequiredCourse.findAll();
    // 사용자 수강내역에 패스한 code만
    const passedCodes = (await Records.findAll({
      where: {
        userId,
        courseName: { [Op.in]: required.map(r => r.courseCode) },
        grade: { [Op.ne]: null }
      }
    })).filter(r => isPassedGrade(r.grade))
      .map(r => r.courseName);

    // 누락된 과목
    const missing = required
      .filter(r => !passedCodes.includes(r.courseCode))
      .map(r => ({ courseCode: r.courseCode, name: r.name, category: r.category }));

    return { missing, countMissing: missing.length, totalRequired: required.length };
  },

  /** 어학 자격 & 졸업작품 & 기타 결격 사유 */
  async getDisqualifications(userId) {
    const disc = [];

    // 어학자격
    const certCount = await Certificate.count({ where: { userId } });
    if (certCount === 0) disc.push('어학자격 미취득');

    // 전공필수과목 미이수 (종합설계2 포함)
    const req = await this.getRequiredMissing(userId);
    const majorReqs = req.missing.filter(m => m.category === 'major_required');
    if (majorReqs.length > 0) disc.push('전공필수 미이수');

    // 현장실무교과
    const prac = await Records.count({ where: { userId, type: 'practical', grade: { [Op.ne]: null } } });
    if (prac < THRESHOLDS.practicalCount) disc.push('현장실무교과 미이수');

    return disc;
  },

  /** 핵심교양 이수 여부 */
  async getCoreCompletion(userId) {
    const libCredits = (await Records.sum('credits', { where: { userId, type: 'general', grade: { [Op.ne]: null } } })) || 0;
    return {
      passed: libCredits >= THRESHOLDS.liberalArts,
      actual: libCredits,
      threshold: THRESHOLDS.liberalArts
    };
  },

  /** 졸업사정 종합현황 */
  async getStatusOverview(userId) {
    const pass = await this.getGraduationPass(userId);
    const miss = await this.getRequiredMissing(userId);
    const disq = await this.getDisqualifications(userId);
    return { pass, missingCourses: miss, disqualifications: disq };
  }
};
