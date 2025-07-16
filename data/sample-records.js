// data/sample-records.js
// 한국공학대학교 컴퓨터공학부 샘플 성적 데이터

const SAMPLE_RECORDS = [
    // 1학년 1학기
    { courseCode: 'LA001', courseName: '글쓰기', credits: 3, grade: 'A', semester: '2021-1', type: '교양필수' },
    { courseCode: 'LA002', courseName: '대학영어', credits: 2, grade: 'B+', semester: '2021-1', type: '교양필수' },
    { courseCode: 'MATH001', courseName: '수학1(미적분학I)', credits: 3, grade: 'A+', semester: '2021-1', type: '계열기초' },
    { courseCode: 'LA004', courseName: '가치와비전', credits: 1, grade: 'P', semester: '2021-1', type: '교양필수' },
    { courseCode: 'CE001', courseName: '이산수학', credits: 3, grade: 'A', semester: '2021-1', type: '전공필수' },
    { courseCode: 'GE001', courseName: '문학과 예술의 이해', credits: 3, grade: 'B+', semester: '2021-1', type: '교양선택' },

    // 1학년 2학기
    { courseCode: 'LA003', courseName: '글로벌잉글리시', credits: 2, grade: 'A', semester: '2021-2', type: '교양필수' },
    { courseCode: 'MATH002', courseName: '수학2(미적분학II)', credits: 3, grade: 'A', semester: '2021-2', type: '계열기초' },
    { courseCode: 'LA005', courseName: '탐구와실천', credits: 1, grade: 'P', semester: '2021-2', type: '교양필수' },
    { courseCode: 'CE002', courseName: '자료구조', credits: 3, grade: 'A+', semester: '2021-2', type: '전공필수' },
    { courseCode: 'PHYS001', courseName: '물리학', credits: 3, grade: 'B', semester: '2021-2', type: '계열기초' },
    { courseCode: 'GE002', courseName: '역사와 철학의 이해', credits: 3, grade: 'A', semester: '2021-2', type: '교양선택' },

    // 2학년 1학기
    { courseCode: 'CE003', courseName: '알고리즘', credits: 3, grade: 'A+', semester: '2022-1', type: '전공필수' },
    { courseCode: 'CE004', courseName: '컴퓨터구조', credits: 3, grade: 'A', semester: '2022-1', type: '전공필수' },
    { courseCode: 'MATH003', courseName: '선형대수학', credits: 3, grade: 'B+', semester: '2022-1', type: '계열기초' },
    { courseCode: 'CE105', courseName: 'UNIX시스템프로그래밍', credits: 3, grade: 'A', semester: '2022-1', type: '전공선택' },
    { courseCode: 'GE003', courseName: '기업과 미디어의 이해', credits: 3, grade: 'B+', semester: '2022-1', type: '교양선택' },

    // 2학년 2학기
    { courseCode: 'CE005', courseName: '운영체제', credits: 3, grade: 'A', semester: '2022-2', type: '전공필수' },
    { courseCode: 'CE006', courseName: '데이터베이스', credits: 3, grade: 'A+', semester: '2022-2', type: '전공필수' },
    { courseCode: 'CE106', courseName: '모바일프로그래밍', credits: 3, grade: 'A', semester: '2022-2', type: '전공선택' },
    { courseCode: 'MATH004', courseName: '확률및통계학', credits: 3, grade: 'B', semester: '2022-2', type: '계열기초' },
    { courseCode: 'GE004', courseName: '인간과 사회의 이해', credits: 3, grade: 'A', semester: '2022-2', type: '교양선택' },

    // 3학년 1학기
    { courseCode: 'CE007', courseName: '컴퓨터네트워크', credits: 3, grade: 'A', semester: '2023-1', type: '전공필수' },
    { courseCode: 'CE107', courseName: '웹서비스프로그래밍', credits: 3, grade: 'A+', semester: '2023-1', type: '전공선택' },
    { courseCode: 'CE112', courseName: '인공지능', credits: 3, grade: 'A', semester: '2023-1', type: '전공선택' },
    { courseCode: 'CE108', courseName: '소프트웨어공학', credits: 3, grade: 'B+', semester: '2023-1', type: '전공선택' },
    { courseCode: 'LA006', courseName: '진로와미래', credits: 1, grade: 'P', semester: '2023-1', type: '교양필수' },

    // 3학년 2학기
    { courseCode: 'CE110', courseName: '네트워크프로그래밍', credits: 3, grade: 'A', semester: '2023-2', type: '전공선택' },
    { courseCode: 'CE114', courseName: '프론트엔드프로그래밍', credits: 3, grade: 'A+', semester: '2023-2', type: '전공선택' },
    { courseCode: 'CE102', courseName: '클라우드컴퓨팅', credits: 3, grade: 'A', semester: '2023-2', type: '전공선택' },
    { courseCode: 'CE117', courseName: '임베디드시스템', credits: 3, grade: 'B+', semester: '2023-2', type: '전공선택' },

    // 4학년 1학기 (예정)
    { courseCode: 'CE008', courseName: '종합설계기획', credits: 1, grade: null, semester: '2024-1', type: '전공필수' },
    { courseCode: 'CE113', courseName: '오픈소스SW기초', credits: 3, grade: null, semester: '2024-1', type: '전공선택' },
    { courseCode: 'CE118', courseName: 'IoT설계', credits: 3, grade: null, semester: '2024-1', type: '전공선택' },
    { courseCode: 'CE119', courseName: 'HCI개론', credits: 3, grade: null, semester: '2024-1', type: '전공선택' },

    // 4학년 2학기 (예정)
    { courseCode: 'CE009', courseName: '종합설계1', credits: 3, grade: null, semester: '2024-2', type: '전공필수' },
    { courseCode: 'CE010', courseName: '종합설계2', credits: 3, grade: null, semester: '2025-1', type: '전공필수' }
];

// 특정 사용자에게 샘플 데이터 추가하는 함수
const createSampleRecordsForUser = (userId) => {
    return SAMPLE_RECORDS.map(record => ({
        ...record,
        userId: userId,
        id: undefined // DB에서 자동 생성
    }));
};

// 년도별 이수 학점 계산
const calculateCreditsByYear = (records) => {
    const creditsByYear = {};

    records.forEach(record => {
        if (record.grade && ['A+', 'A', 'B+', 'B', 'C+', 'C', 'P'].includes(record.grade)) {
            const year = record.semester.split('-')[0];
            if (!creditsByYear[year]) {
                creditsByYear[year] = 0;
            }
            creditsByYear[year] += record.credits;
        }
    });

    return creditsByYear;
};

// 과목 타입별 이수 학점 계산
const calculateCreditsByType = (records) => {
    const creditsByType = {
        '전공필수': 0,
        '전공선택': 0,
        '교양필수': 0,
        '교양선택': 0,
        '계열기초': 0
    };

    records.forEach(record => {
        if (record.grade && ['A+', 'A', 'B+', 'B', 'C+', 'C', 'P'].includes(record.grade)) {
            if (creditsByType.hasOwnProperty(record.type)) {
                creditsByType[record.type] += record.credits;
            }
        }
    });

    return creditsByType;
};

module.exports = {
    SAMPLE_RECORDS,
    createSampleRecordsForUser,
    calculateCreditsByYear,
    calculateCreditsByType
}; 