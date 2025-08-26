// service/GraduationService.js
'use strict';

const { Records, Certificate, RequiredCourse } = require('../models');
const { Op } = require('sequelize');

const THRESHOLDS = {
  totalCredits: 140,
  liberalArts:   42,
  majorCredits:  75,
  practicalCount:1
};

function isPassedGrade(grade) {
  const failSet = new Set(['F', 'U', '미이수', null, undefined]);
  return !failSet.has(grade);
}

module.exports = {
  /** 총·교양·전공 학점 비교 */
  async getGraduationPass(userId) {
    const recs = await Records.findAll({
      where: { userId, grade: { [Op.ne]: null } },
      raw: true,
    });

    let total = 0, lib = 0, major = 0, practical = 0;
    for (const r of recs) {
      if (!isPassedGrade(r.grade)) continue;
      total += Number(r.credits) || 0;
      if (r.type === 'general')   lib    += Number(r.credits) || 0;
      if (r.type === 'major')     major  += Number(r.credits) || 0;
      if (r.type === 'practical') practical += 1;
    }

    return {
      liberal:   { passed: lib    >= THRESHOLDS.liberalArts,   actual: lib,    threshold: THRESHOLDS.liberalArts },
      major:     { passed: major  >= THRESHOLDS.majorCredits,  actual: major,  threshold: THRESHOLDS.majorCredits },
      practical: { passed: practical >= THRESHOLDS.practicalCount, actual: practical, threshold: THRESHOLDS.practicalCount },
      total:     { passed: total  >= THRESHOLDS.totalCredits,  actual: total,  threshold: THRESHOLDS.totalCredits },
    };
  },

  /** 미이수 필수과목 조회 */
  async getRequiredMissing(userId) {
    const required = await RequiredCourse.findAll({ raw: true })
    const requiredCodes = required.map(r => r.courseCode);

    const takenRequired = await Records.findAll({
      where: {
        userId,
        courseCode: { [Op.in]: requiredCodes },
        grade: { [Op.ne]: null },
      },
      raw: true,
    });

    const passedCodes = takenRequired
      .filter(r => isPassedGrade(r.grade))
      .map(r => r.courseCode);

    const missing = required
      .filter(r => !passedCodes.includes(r.courseCode))
      .map(r => ({ courseCode: r.courseCode, name: r.name, category: r.category }));

    return { missing, countMissing: missing.length, totalRequired: required.length };
  },

  /** 캡스톤 이수 여부 */
  async getCapstoneCompleted(userId) {
    const requiredCapstones = await RequiredCourse.findAll({
      where: { category: 'capstone' },
      raw: true,
    });
    if (requiredCapstones.length === 0) return false;

    const codes = requiredCapstones.map(r => r.courseCode);
    const taken = await Records.findAll({
      where: { userId, courseCode: { [Op.in]: codes }, grade: { [Op.ne]: null } },
      raw: true,
    });

    const allPassed = codes.every(code =>
      taken.some(t => t.courseCode === code && isPassedGrade(t.grade))
    );
    return allPassed;
  },

  /** 어학, 전공필수 , 현장실습, 캡스톤 결격 사유 */
  async getDisqualifications(userId) {
    const disc = [];

    // 어학자격
    const certCount = await Certificate.count({ where: { userId } });
    if (certCount === 0) disc.push('어학자격 미취득');

    // 전공필수
    const req = await this.getRequiredMissing(userId);
    const majorReqs = req.missing.filter(m => m.category === 'major_required');
    if (majorReqs.length > 0) disc.push('전공필수 미이수');

    // 현장실습
    const practicalTaken = await Records.count({
      where: { userId, type: 'practical', grade: { [Op.ne]: null } },
    });
    if (practicalTaken < THRESHOLDS.practicalCount) disc.push('현장실무교과 미이수');

    // 캡스톤
    const capstoneCompleted = await this.getCapstoneCompleted(userId);
    if (!capstoneCompleted) disc.push('캡스톤 미이수');

    return disc;
  },

  /** 핵심교양 이수 여부 */
  async getCoreCompletion(userId) {
    const libCredits = (await Records.sum('credits', {
      where: { userId, type: 'general', grade: { [Op.ne]: null } },
    })) || 0;

    return {
      passed: libCredits >= THRESHOLDS.liberalArts,
      actual: libCredits,
      threshold: THRESHOLDS.liberalArts,
    };
  },

  /** 종합 현황 */
  async getStatusOverview(userId) {
    const pass = await this.getGraduationPass(userId);
    const missingCourses = await this.getRequiredMissing(userId);
    const disqualifications = await this.getDisqualifications(userId);

    // 플래그
    const flags = {
      englishRequirementMet: !disqualifications.includes('어학자격 미취득'),
      internshipCompleted:   !disqualifications.includes('현장실무교과 미이수'),
      capstoneCompleted:     !disqualifications.includes('캡스톤 미이수'),
    };

    return { pass, missingCourses, disqualifications, flags };
  },
};