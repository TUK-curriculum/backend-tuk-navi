const { Records, Certificate, RecentLecture, GraduationInfo, LectureReplacement, UserProfile, GraduationRequirement } = require('../models');
const { Op } = require('sequelize');

const toMajorCode = (dept) => {
    if (!dept) return null;
    if (dept.trim() === '소프트웨어전공') return 'SW';
    if (dept.trim() === '컴퓨터공학전공') return 'CE';
    return null;
};

async function getThresholds(enrollmentYear) {
    const requirement = await GraduationRequirement.findOne({
        where: {
            entry_year_start: { [Op.lte]: enrollmentYear },
            [Op.or]: [
                { entry_year_end: null },
                { entry_year_end: { [Op.gte]: enrollmentYear } }
            ]
        },
        raw: true
    });

    if (!requirement) {
        throw new Error(`졸업 요건을 찾을 수 없습니다: ${enrollmentYear}`);
    }

    return {
        totalCredits: requirement.total_credits,
        liberalArts: requirement.liberal_arts,
        majorCredits: requirement.major,
        practicalCount: 1,
    };
}

const isPassedGrade = (g) => (g !== 'F' && g !== 'NP');
const norm = (s) => (typeof s === 'string' ? s.trim().toUpperCase() : s);
const normName = (s) => (typeof s === 'string' ? s.replace(/\s+/g, '').trim() : s);

const CAPSTONE_NAMES = ['종합설계기획', '종합설계1', '종합설계2'].map(normName);

async function saveGraduationInfo(userId, overview) {
    const {
        totalCredits,
        majorRequired,
        generalRequired,
        totalRequired,
        extra,
        diagnosis
    } = overview;

    const remaining = totalRequired - totalCredits;
    const ratio = ((totalCredits / totalRequired) * 100).toFixed(2);

    await GraduationInfo.upsert({
        userId,
        total_credits: totalCredits,
        major_required: majorRequired,
        general_required: generalRequired,
        total_required: totalRequired,
        remaining_credits: Math.max(remaining, 0),
        progress_ratio: ratio,
        extra: extra || {},
        diagnosis: diagnosis || {},
        updated_at: new Date()
    });
}

async function getRequiredMissing(userId) {
    const profile = await UserProfile.findOne({ where: { userId }, attributes: ['major', 'student_id', 'enrollment_year'], raw: true });
    if (!profile) throw new Error('사용자 정보를 찾을 수 없습니다.');

    const userMajorCode = toMajorCode(profile.major);
    if (!userMajorCode) throw new Error(`지원하지 않는 전공: ${profile.major}`);

    const enrollmentYear = Number(profile.enrollment_year);
    const studentIdYear = Number((profile.student_id || '').substring(0, 4));
    const isNewStudent = (enrollmentYear >= 2025) || (studentIdYear >= 2025);

    let required = await RecentLecture.findAll({
        where: { type: { [Op.in]: ['GR', 'MR'] }, major: userMajorCode },
        raw: true,
    });

    const takenAll = await Records.findAll({ where: { userId }, raw: true });
    const passedCodes = new Set(takenAll.filter(t => isPassedGrade(t.grade)).map(t => norm(t.courseCode)));
    const passedNames = new Set(takenAll.filter(t => isPassedGrade(t.grade)).map(t => normName(t.courseName || t.name)));

    const replacements = await LectureReplacement.findAll({ raw: true });
    const replaceMap = new Map();
    replacements.forEach(r => {
        const orig = norm(r.original_code);
        const repl = norm(r.replacement_code);
        if (!replaceMap.has(orig)) replaceMap.set(orig, []);
        replaceMap.get(orig).push(repl);
    });

    const missing = required.filter(r => {
        const code = norm(r.code);
        const name = normName(r.name);
        if (CAPSTONE_NAMES.includes(name)) return !passedNames.has(name);
        if (passedCodes.has(code)) return false;

        const replList = replaceMap.get(code) || [];
        if (replList.some(repl => passedCodes.has(repl))) return false;

        if ((r.type === 'GR' || r.type === 'MR') && r.credits === 1 && replList.length === 0) {
            return isNewStudent;
        }
        return true;
    }).map(r => ({
        courseCode: r.code,
        name: r.name,
        credits: r.credits,
        category: r.type === 'GR' ? 'general_required' : 'major_required'
    }));

    return { missing, countMissing: missing.length, totalRequired: required.length };
}

async function getCapstoneCompleted(userId) {
    const all = await Records.findAll({ where: { userId, grade: { [Op.ne]: null } }, raw: true });
    const passedNames = new Set(all.filter(r => isPassedGrade(r.grade)).map(r => normName(r.courseName || r.name)));
    return CAPSTONE_NAMES.every(n => passedNames.has(n));
}

async function getGraduationPass(userId, profile) {
    const recs = await Records.findAll({ where: { userId }, raw: true });
    const thresholds = await getThresholds(Number(profile.enrollment_year));

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
}

async function getDisqualifications(userId, profile) {
    const disc = [];
    const thresholds = await getThresholds(Number(profile.enrollment_year));

    if (await Certificate.count({ where: { userId } }) === 0) disc.push('어학자격 미취득');

    const req = await getRequiredMissing(userId);
    if (req.missing.some(m => m.category === 'major_required')) disc.push('전공필수 미이수');
    if (req.missing.some(m => m.category === 'general_required')) disc.push('교양필수 미이수');

    const practicalTaken = await Records.count({ where: { userId, type: 'RE', grade: { [Op.ne]: null } } });
    if (practicalTaken < thresholds.practicalCount) disc.push('현장실무교과 미이수');

    if (!(await getCapstoneCompleted(userId))) disc.push('종합설계 미이수');

    return disc;
}

async function getStatusOverview(userId) {
    const profile = await UserProfile.findOne({ where: { userId }, raw: true });
    if (!profile) throw new Error('사용자 정보를 찾을 수 없습니다.');

    const pass = await getGraduationPass(userId, profile);
    const disqualifications = await getDisqualifications(userId, profile);

    const totalRequired = pass.total.threshold;
    const majorRequiredThreshold = pass.major.threshold;
    const generalRequiredThreshold = pass.liberal.threshold;

    const totalCredits = pass.total.actual;
    const majorCredits = pass.major.actual;
    const generalCredits = pass.liberal.actual;

    const completionRate = Math.round((totalCredits / totalRequired) * 100);

    const info = await GraduationInfo.findOne({ where: { userId }, raw: true });

    const extra = info?.extra || {
        capstoneCompleted: !disqualifications.includes('종합설계 미이수'),
        englishRequirementMet: !disqualifications.includes('어학자격 미취득'),
        internshipCompleted: !disqualifications.includes('현장실무교과 미이수'),
    };

    
    return {
        totalCredits, 
        majorRequired: majorCredits,
        generalRequired: generalCredits,
        totalRequired,
        extra,
        diagnosis: {
            lackItems: disqualifications,
            completionRate,
            totalCompleted: totalCredits,
            totalRequired,
            majorCompleted: majorCredits,
            majorRequired: majorRequiredThreshold,
            liberalCompleted: generalCredits,
            liberalRequired: generalRequiredThreshold
        }
    };
}

module.exports = {
    saveGraduationInfo,
    getRequiredMissing,
    getCapstoneCompleted,
    getGraduationPass,
    getDisqualifications,
    getStatusOverview,
};