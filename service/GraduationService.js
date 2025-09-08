// service/GraduationService.js
'use strict';

const { Records, Certificate, RecentLecture, User,  GraduationInfo, LectureReplacement, UserProfile } = require('../models');
const { Op } = require('sequelize');

// 전공 매핑 
const toMajorCode = (dept) => {
  if (!dept) return null;
  if (dept.trim() === '소프트웨어전공') return 'SW';
  if (dept.trim() === '컴퓨터공학전공') return 'CE';
  return null;
};

// 학번별 졸업 요건
function getThresholds(enrollmentYear) {
  if (enrollmentYear === 2012) {
    return { totalCredits: 150, liberalArts: 27, majorCredits: 75, practicalCount: 1 };
  }
  if (enrollmentYear >= 2013 && enrollmentYear <= 2015) {
    return { totalCredits: 150, liberalArts: 27, majorCredits: 75, practicalCount: 1 };
  }
  if (enrollmentYear === 2016) {
    return { totalCredits: 150, liberalArts: 27, majorCredits: 75, practicalCount: 1 };
  }
  if (enrollmentYear >= 2017 && enrollmentYear <= 2020) {
    return { totalCredits: 140, liberalArts: 25, majorCredits: 70, practicalCount: 1 };
  }
  if (enrollmentYear >= 2021 && enrollmentYear <= 2024) {
    return { totalCredits: 140, liberalArts: 42, majorCredits: 75, practicalCount: 1 };
  }
  if (enrollmentYear >= 2025) {
    return { totalCredits: 130, liberalArts: 37, majorCredits: 69, practicalCount: 1 };
  }
  return { totalCredits: 140, liberalArts: 25, majorCredits: 70, practicalCount: 1 };
}

// 성적 통과 여부
const isPassedGrade = (g) => {
  if (g === null || g === undefined) return true;
  // F/NP만 제외
  return !new Set(['F', 'NP']).has(g);
};

const norm     = (s) => (typeof s === 'string' ? s.trim().toUpperCase() : s);
const normName = (s) => (typeof s === 'string' ? s.replace(/\s+/g, '').trim() : s);
const CAPSTONE_NAMES = ['종합설계기획', '종합설계1', '종합설계2'].map(normName);
const CAPSTONE_GROUPS = ['종합설계기획', '종합설계1', '종합설계2'];

async function saveGraduationInfo(userId, overview) {
  const { pass, missingCourses, disqualifications, flags } = overview;

  // 사용자의 이수 내역 전체 가져오기
  const recs = await Records.findAll({
    where: { userId },
    raw: true,
  });

  // 카테고리별 학점 합산
  let majorRequired = 0, majorElective = 0, generalRequired = 0, generalElective = 0;
  let total = 0;

  for (const r of recs) {
    if (!isPassedGrade(r.grade)) continue;
    const credits = Number(r.credits) || 0;
    total += credits;

    switch (r.type) {
      case 'MR': majorRequired   += credits; break;
      case 'ME': majorElective   += credits; break;
      case 'GR': generalRequired += credits; break;
      case 'GE': generalElective += credits; break;
      default: break;
    }
  }

  const remaining = pass.total.threshold - total;
  const ratio = ((total / pass.total.threshold) * 100).toFixed(2);

  await GraduationInfo.upsert({
    userId,
    total_credits: total,
    major_required: majorRequired,
    major_elective: majorElective,
    general_required: generalRequired,
    general_elective: generalElective,
    total_required: pass.total.threshold,
    remaining_credits: remaining > 0 ? remaining : 0,
    progress_ratio: ratio,
    extra: flags,
    diagnosis: {
      missingCourses: missingCourses.missing,
      disqualifications
    },
    updated_at: new Date()
  });
}

/** 미이수 필수과목 조회 */
async function getRequiredMissing(userId) {
  // 사용자 프로필 조회
  const profile = await UserProfile.findOne({
    where: { userId },
    attributes: ['major', 'student_id', 'enrollment_year'],
    raw: true,
  });
  if (!profile) throw new Error('사용자 정보를 찾을 수 없습니다.');

  const userMajorCode = toMajorCode(profile.major);
  if (!userMajorCode) throw new Error(`지원하지 않는 전공: ${profile.major}`);

  // 2025학번 이상 여부
  const enrollmentYear = Number(profile.enrollment_year);
  const studentIdYear = Number((profile.student_id || '').substring(0, 4));
  const isNewStudent =
    (enrollmentYear && enrollmentYear >= 2025) ||
    (studentIdYear && studentIdYear >= 2025);

  // 전공필수(MR), 교양필수(GR) 조회
  let required = await RecentLecture.findAll({
    where: { type: { [Op.in]: ['GR', 'MR'] }, major: userMajorCode },
    raw: true,
  });

  required = required.filter(r => {
    const name = normName(r.name);
    if (name === '종합설계기획') return r.credits === 1;
    if (name === '종합설계1')   return r.credits === 3;
    if (name === '종합설계2')   return r.credits === 3;
    return true;
  });

  // 사용자 이수 내역
  const takenAll = await Records.findAll({ where: { userId }, raw: true });

  const passedCodes = new Set(
    takenAll.filter(t => isPassedGrade(t.grade))
            .map(t => norm(t.courseCode))
            .filter(Boolean)
  );
  const passedNames = new Set(
    takenAll.filter(t => isPassedGrade(t.grade))
            .map(t => normName(t.courseName || t.name))
            .filter(Boolean)
  );

  // 대체 인정 강의 매핑
  const replacements = await LectureReplacement.findAll({ raw: true });
  const replaceMap = new Map();
  for (const r of replacements) {
    const orig = norm(r.original_code);
    const repl = norm(r.replacement_code);
    if (!replaceMap.has(orig)) replaceMap.set(orig, []);
    replaceMap.get(orig).push(repl);
  }

  const missing = required.filter(r => {
    const code = norm(r.code);
    const name = normName(r.name);

    if (CAPSTONE_NAMES.includes(name)) {
      return !passedNames.has(name);
    }

    if (passedCodes.has(code)) return false;

    // 대체 코드 매칭
    const replList = replaceMap.get(code) || [];
    for (const repl of replList) {
      if (passedCodes.has(repl)) return false;
    }

    // 1학년 필수 과목 - 대체 교과목 없다면 25학번 이상만 미이수 처리
    if (r.type === 'GR' || r.type === 'MR' && r.credits === 1 && replList.length === 0) {
      return isNewStudent;
    }

    return true;
  }).map(r => ({
    courseCode: r.code,
    name: r.name,
    credits: r.credits,
    category: r.type === 'GR' ? 'general_required' : 'major_required'
  }));

  return {
    missing,
    countMissing: missing.length,
    totalRequired: required.length,
  };
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
  async getGraduationPass(userId, profile) {
    const recs = await Records.findAll({
      where: { userId },
      raw: true,
    });

    const thresholds = getThresholds(Number(profile.enrollment_year));

    let total = 0, lib = 0, major = 0, practical = 0;
    for (const r of recs) {
      if (!isPassedGrade(r.grade)) continue;
      total += Number(r.credits) || 0;
      if (['GR', 'GE'].includes(r.type)) lib += Number(r.credits) || 0;
      if (['MR', 'ME'].includes(r.type)) major += Number(r.credits) || 0;
      if (r.type === 'RE') practical += 1;
    }

    return {
      liberal:   { passed: lib >= thresholds.liberalArts,   actual: lib,   threshold: thresholds.liberalArts },
      major:     { passed: major >= thresholds.majorCredits, actual: major, threshold: thresholds.majorCredits },
      practical: { passed: practical >= thresholds.practicalCount, actual: practical, threshold: thresholds.practicalCount },
      total:     { passed: total >= thresholds.totalCredits, actual: total, threshold: thresholds.totalCredits },
    };
  },

  getRequiredMissing,   // 미이수 필수과목
  getCapstoneCompleted,   // 종합설계 이수 여부

  /** 결격 사유 (어학/필수과목/현장실무/종합설계) */
  async getDisqualifications(userId, profile) {
    const disc = [];
    const thresholds = getThresholds(Number(profile.enrollment_year));

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
    if (practicalTaken < thresholds.practicalCount) disc.push('현장실무교과 미이수');

    // 종합설계
    const capstonePass = await getCapstoneCompleted(userId);
    if (!capstonePass) disc.push('종합설계 미이수');

    return disc;
  },

/*
  // 핵심교양 이수 여부
  async getCoreCompletion(userId) {
    const libCredits =
      (await Records.sum('credits', {
        where: { userId, type: { [Op.in]: ['GR', 'GE'] }, grade: { [Op.ne]: null } },
      })) || 0;

    return {
      passed: libCredits >= THRESHOLDS.liberalArts,
      actual: libCredits,
      threshold: THRESHOLDS.liberalArts,
    };
  },
*/


  /** 종합 현황 */
  async getStatusOverview(userId) {
    const profile = await UserProfile.findOne({ where: { userId }, raw: true });
    if (!profile) throw new Error('사용자 정보를 찾을 수 없습니다.');

    const pass = await this.getGraduationPass(userId, profile);
    const missingCourses = await getRequiredMissing(userId);
    const disqualifications = await this.getDisqualifications(userId, profile);

    const flags = {
      englishRequirementMet: !disqualifications.includes('어학자격 미취득'),
      internshipCompleted:   !disqualifications.includes('현장실무교과 미이수'),
      capstoneCompleted:     !disqualifications.includes('종합설계 미이수'),
    };

    const overview = { 
      pass, 
      missingCourses, 
      disqualifications, 
      flags,
      totalCredits: pass.total.actual,
      majorCredits: pass.major.actual,
      liberalCredits: pass.liberal.actual
    };

    await saveGraduationInfo(userId, overview);

    return overview;
  }
};
