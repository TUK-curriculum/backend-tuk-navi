function parseSemester(semesterStr) {
  const match = semesterStr.match(/(\d{4})-(\d)학기/);
  if (!match) return null;
  return { year: parseInt(match[1], 10), sem: parseInt(match[2], 10) };
}

function semesterOrder(year, sem) {
  return (year * 10) + sem;
}

function getCurrentGradeAndSem(enrollmentYear, records = []) {
  const now = new Date();
  const year = now.getFullYear();
  const sem = now.getMonth() < 6 ? 1 : 2;

  let semesterCount = (year - enrollmentYear) * 2 + sem;

  const takenSemesters = new Set(
    records.map(r => `${r.year}-${r.sem}`)
  );
  while (!takenSemesters.has(`${enrollmentYear + Math.floor((semesterCount-1)/2)}-${((semesterCount-1)%2)+1}`) 
         && semesterCount > 0) {
    semesterCount--;
  }

  const grade = Math.floor((semesterCount-1) / 2) + 1;
  const semInGrade = ((semesterCount-1) % 2) + 1;
  return { grade, sem: semInGrade };
}

/**
 * records 배열을 받아 학년/학기 계산
 * @param {Array} records
 * @param {number} admissionYear
 */
function mapRecordsToSemesters(records, admissionYear) {
  const admission = parseInt(admissionYear, 10);
  if (isNaN(admission)) {
    console.warn("[WARN] admissionYear invalid:", admissionYear);
    return [];
  }

  // 수강 내역
  const parsed = records
    .map(r => {
      const semInfo = parseSemester(r.semester);
      if (!semInfo) return null;
      return { record: r, ...semInfo };
    })
    .filter(Boolean)
    .sort((a, b) => semesterOrder(a.year, a.sem) - semesterOrder(b.year, b.sem));

  // 학기 목록 추출
  const uniqueSemesters = [...new Set(parsed.map(p => `${p.year}-${p.sem}`))];

  // 실제 수강 순서대로 학기 번호 설정
  const semesterIndexMap = new Map();
  uniqueSemesters.forEach((semStr, idx) => {
    const grade = Math.floor(idx / 2) + 1;
    const semInGrade = (idx % 2) + 1;
    semesterIndexMap.set(semStr, { grade, semInGrade });
  });

  // 매핑 결과
  return parsed.map(item => {
    const key = `${item.year}-${item.sem}`;
    const { grade, semInGrade } = semesterIndexMap.get(key) || {};
    return { ...item, grade, semInGrade };
  });
}

module.exports = { parseSemester, mapRecordsToSemesters, getCurrentGradeAndSem };