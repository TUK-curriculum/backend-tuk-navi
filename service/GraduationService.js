// service/GraduationService.js
'use strict';

const { Records, Certificate, RecentLecture, User } = require('../models');
const { Op } = require('sequelize');

// 전공 매핑 
const toMajorCode = (dept) => {
  if (!dept) return null;
  if (dept.trim() === '소프트웨어학과') return 'SW';
  if (dept.trim() === '컴퓨터공학과') return 'CE';
  return null;
};

const THRESHOLDS = {
  totalCredits: 140,
  liberalArts: 42,
  majorCredits: 75,
  practicalCount: 1,
};

// 성적 통과 여부
const isPassedGrade = (g) => !new Set(['F', 'U', '미이수', null, undefined]).has(g);

const norm     = (s) => (typeof s === 'string' ? s.trim().toUpperCase() : s);
const normName = (s) => (typeof s === 'string' ? s.replace(/\s+/g, '').trim() : s);
const CAPSTONE_NAMES = ['종합설계기획', '종합설계1', '종합설계2'].map(normName);
const CAPSTONE_GROUPS = ['종합설계기획', '종합설계1', '종합설계2'];

/** 미이수 필수과목 조회 */
async function getRequiredMissing(userId) {
  // 사용자 전공
  const user = await User.findOne({
    where: { id: userId },
    attributes: ['major'],
    raw: true,
  });
  if (!user) throw new Error('사용자 정보를 찾을 수 없습니다.');
  
  const userMajorCode = toMajorCode(user.major);
  if (!userMajorCode) {
    throw new Error(`지원하지 않는 전공: ${user.major}`);
  }

  // 해당 전공 필수 과목 (GR = 교필, MR = 전필)
  const required = await RecentLecture.findAll({
    where: { type: { [Op.in]: ['GR', 'MR'] }, major: userMajorCode },
    raw: true,
  });

  // 사용자 이수 내역 확인
  const takenAll = await Records.findAll({
    where: { userId, grade: { [Op.ne]: null } },
    raw: true,
  });
  const passedCodes = new Set(
    takenAll.filter(t => isPassedGrade(t.grade))
            .map(t => norm(t.courseCode || t.code))
            .filter(Boolean)
  );

  // 종합설계 외 미이수 필수 과목
  const nonCapstoneMissing = required
    .filter(r => !CAPSTONE_GROUPS.includes(r.name))                 // 종합설계 제외
    .filter(r => !passedCodes.has(norm(r.code)))                    // 아직 못 들음
    .map(r => ({
      courseCode: r.code,
      name: r.name,
      credits: r.credits,
      category: r.type === 'MR' ? 'major_required' : 'general_required',
    }));

  const missing = [];
  missing.push(...nonCapstoneMissing);

  // 종합설계 과목 미이수 확인
  const grouped = {};
  for (const r of required) {
    if (CAPSTONE_GROUPS.includes(r.name)) {
      (grouped[r.name] ||= []).push(r);
    }
  }

  for (const groupName of CAPSTONE_GROUPS) {
    const groupCourses = grouped[groupName] || [];
    if (groupCourses.length > 0) {
      const passedInGroup = groupCourses.some(c => passedCodes.has(norm(c.code)));
      if (!passedInGroup) {
        const rep = groupCourses[0]; 
        missing.push({
          courseCode: rep.code,
          name: rep.name,
          credits: rep.credits,
          category: 'major_required',
        });
      }
    }
  }

  return { missing, countMissing: missing.length, totalRequired: required.length };
}

/** 종합설계 이수 여부 */
async function getCapstoneCompleted(userId) {
  const all = await Records.findAll({
    where: { userId, grade: { [Op.ne]: null } },
    raw: true,
  });

  const passedNames = new Set(
    all
      .filter(r => isPassedGrade(r.grade))
      .map(r => normName(r.courseName || r.name))
      .filter(Boolean)
  );

  return CAPSTONE_NAMES.every(n => passedNames.has(n));
}

module.exports = {
  /** 총·교양·전공·실습 통과 여부 */
  async getGraduationPass(userId) {
    const recs = await Records.findAll({
      where: { userId, grade: { [Op.ne]: null } },
      raw: true,
    });

    let total = 0, lib = 0, major = 0, practical = 0;
    for (const r of recs) {
      if (!isPassedGrade(r.grade)) continue;
      total += Number(r.credits) || 0;
      if (r.type === 'general')   lib += Number(r.credits) || 0;
      if (r.type === 'major')     major += Number(r.credits) || 0;
      if (r.type === 'practical') practical += 1;
    }

    return {
      liberal:   { passed: lib >= THRESHOLDS.liberalArts,   actual: lib,   threshold: THRESHOLDS.liberalArts },
      major:     { passed: major >= THRESHOLDS.majorCredits, actual: major, threshold: THRESHOLDS.majorCredits },
      practical: { passed: practical >= THRESHOLDS.practicalCount, actual: practical, threshold: THRESHOLDS.practicalCount },
      total:     { passed: total >= THRESHOLDS.totalCredits, actual: total, threshold: THRESHOLDS.totalCredits },
    };
  },

  getRequiredMissing,   // 미이수 필수과목
  getCapstoneCompleted,   // 종합설계 이수 여부

  /** 결격 사유 (어학/필수과목/현장실무/종합설계) */
  async getDisqualifications(userId) {
    const disc = [];

    // 어학
    const certCount = await Certificate.count({ where: { userId } });
    if (certCount === 0) disc.push('어학자격 미취득');

    // 필수 과목 미이수
    const req = await getRequiredMissing(userId);
    if (req.missing.some(m => m.category === 'major_required'))   disc.push('전공필수 미이수');
    if (req.missing.some(m => m.category === 'general_required')) disc.push('교양필수 미이수');

    // 현장실무
    const practicalTaken = await Records.count({
      where: { userId, type: 'practical', grade: { [Op.ne]: null } },
    });
    if (practicalTaken < THRESHOLDS.practicalCount) disc.push('현장실무교과 미이수');

    // 종합설계
    const capstonePass = await getCapstoneCompleted(userId);
    if (!capstonePass) disc.push('종합설계 미이수');

    return disc;
  },

  /** 핵심교양 이수 여부 */
  async getCoreCompletion(userId) {
    const libCredits =
      (await Records.sum('credits', {
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
    const missingCourses = await getRequiredMissing(userId);
    const disqualifications = await this.getDisqualifications(userId);

    const flags = {
      englishRequirementMet: !disqualifications.includes('어학자격 미취득'),
      internshipCompleted:   !disqualifications.includes('현장실무교과 미이수'),
      capstoneCompleted:     !disqualifications.includes('종합설계 미이수'),
    };

    return { pass, missingCourses, disqualifications, flags };
  },
};
