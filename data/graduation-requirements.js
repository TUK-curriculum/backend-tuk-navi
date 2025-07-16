// data/graduation-requirements.js
// 한국공학대학교 컴퓨터공학부 2021-2022학번 졸업요건

const GRADUATION_REQUIREMENTS = {
    // 전체 졸업 학점
    TOTAL_CREDITS: 130,

    // 전공 과목
    MAJOR: {
        REQUIRED_CREDITS: 28, // 전공필수 학점
        ELECTIVE_CREDITS: 42, // 전공선택 학점 (최소)
        TOTAL_CREDITS: 70,    // 전공 총 학점

        // 전공필수 과목
        REQUIRED_COURSES: [
            { code: 'CE001', name: '이산수학', credits: 3, semester: 1 },
            { code: 'CE002', name: '자료구조', credits: 3, semester: 2 },
            { code: 'CE003', name: '알고리즘', credits: 3, semester: 3 },
            { code: 'CE004', name: '컴퓨터구조', credits: 3, semester: 3 },
            { code: 'CE005', name: '운영체제', credits: 3, semester: 4 },
            { code: 'CE006', name: '데이터베이스', credits: 3, semester: 4 },
            { code: 'CE007', name: '컴퓨터네트워크', credits: 3, semester: 5 },
            { code: 'CE008', name: '종합설계기획', credits: 1, semester: 6 },
            { code: 'CE009', name: '종합설계1', credits: 3, semester: 7 },
            { code: 'CE010', name: '종합설계2', credits: 3, semester: 8 }
        ],

        // 전공선택 과목 (예시)
        ELECTIVE_COURSES: [
            { code: 'CE101', name: '스마트센서개론', credits: 3, category: 'IoT' },
            { code: 'CE102', name: '클라우드컴퓨팅', credits: 3, category: 'Cloud' },
            { code: 'CE103', name: '디지털신호처리', credits: 3, category: 'Signal' },
            { code: 'CE104', name: '디지털영상처리', credits: 3, category: 'Image' },
            { code: 'CE105', name: 'UNIX시스템프로그래밍', credits: 3, category: 'System' },
            { code: 'CE106', name: '모바일프로그래밍', credits: 3, category: 'Mobile' },
            { code: 'CE107', name: '웹서비스프로그래밍', credits: 3, category: 'Web' },
            { code: 'CE108', name: '소프트웨어공학', credits: 3, category: 'Software' },
            { code: 'CE109', name: '컴퓨터응용설계', credits: 3, category: 'Design' },
            { code: 'CE110', name: '네트워크프로그래밍', credits: 3, category: 'Network' },
            { code: 'CE111', name: '네트워크매니지먼트', credits: 3, category: 'Network' },
            { code: 'CE112', name: '인공지능', credits: 3, category: 'AI' },
            { code: 'CE113', name: '오픈소스SW기초', credits: 3, category: 'OpenSource' },
            { code: 'CE114', name: '프론트엔드프로그래밍', credits: 3, category: 'Frontend' },
            { code: 'CE115', name: '논리회로', credits: 3, category: 'Hardware' },
            { code: 'CE116', name: '마이크로프로세서응용', credits: 3, category: 'Hardware' },
            { code: 'CE117', name: '임베디드시스템', credits: 3, category: 'Embedded' },
            { code: 'CE118', name: 'IoT설계', credits: 3, category: 'IoT' },
            { code: 'CE119', name: 'HCI개론', credits: 3, category: 'HCI' }
        ]
    },

    // 교양 과목
    LIBERAL_ARTS: {
        REQUIRED_CREDITS: 10, // 교양필수 학점
        ELECTIVE_CREDITS: 20, // 교양선택 학점 (최소)
        TOTAL_CREDITS: 30,    // 교양 총 학점

        // 교양필수 과목
        REQUIRED_COURSES: [
            { code: 'LA001', name: '글쓰기', credits: 3, category: '기초교양' },
            { code: 'LA002', name: '대학영어', credits: 2, category: '기초교양' },
            { code: 'LA003', name: '글로벌잉글리시', credits: 2, category: '기초교양' },
            { code: 'LA004', name: '가치와비전', credits: 1, category: '기초교양' },
            { code: 'LA005', name: '탐구와실천', credits: 1, category: '기초교양' },
            { code: 'LA006', name: '진로와미래', credits: 1, category: '진로설계' }
        ],

        // 핵심교양 영역 (4개 영역 이상, 각 3학점)
        CORE_AREAS: [
            { area: '문학과예술', required: true, credits: 3 },
            { area: '역사와철학', required: true, credits: 3 },
            { area: '기업과미디어', required: true, credits: 3 },
            { area: '인간과사회', required: true, credits: 3 },
            { area: '자연과생명', required: false, credits: 3 }
        ]
    },

    // 계열기초 (공학기초) 과목
    FOUNDATION: {
        REQUIRED_CREDITS: 30, // 계열기초 필수 학점

        // 수학 과목
        MATH_COURSES: [
            { code: 'MATH001', name: '수학1(미적분학I)', credits: 3, required: true },
            { code: 'MATH002', name: '수학2(미적분학II)', credits: 3, required: true },
            { code: 'MATH003', name: '선형대수학', credits: 3, required: false },
            { code: 'MATH004', name: '확률및통계학', credits: 3, required: false },
            { code: 'MATH005', name: '수치해석', credits: 3, required: false }
        ],

        // 기초과학 과목
        SCIENCE_COURSES: [
            { code: 'PHYS001', name: '물리학', credits: 3, required: false },
            { code: 'PHYS002', name: '물리학실험', credits: 1, required: false },
            { code: 'CHEM001', name: '일반화학1', credits: 3, required: false },
            { code: 'CHEM002', name: '일반화학실험1', credits: 1, required: false },
            { code: 'CHEM003', name: '일반화학2', credits: 3, required: false },
            { code: 'CHEM004', name: '일반화학실험2', credits: 1, required: false },
            { code: 'BIOL001', name: '일반생물학', credits: 3, required: false }
        ]
    },

    // 교시별 시간표
    TIME_SLOTS: [
        { period: 1, time: '09:30-10:20' },
        { period: 2, time: '10:30-11:20' },
        { period: 3, time: '11:30-12:20' },
        { period: 4, time: '12:30-13:20' },
        { period: 5, time: '13:30-14:20' },
        { period: 6, time: '14:30-15:20' },
        { period: 7, time: '15:30-16:20' },
        { period: 8, time: '16:30-17:20' },
        { period: 9, time: '17:25-18:15' },
        { period: 10, time: '18:15-19:05' },
        { period: 11, time: '19:05-19:55' },
        { period: 12, time: '20:00-20:50' },
        { period: 13, time: '20:50-21:40' },
        { period: 14, time: '21:40-22:30' }
    ]
};

// 졸업 요건 체크 함수
const checkGraduationRequirements = (userRecords) => {
    const results = {
        totalCredits: { required: 130, completed: 0, passed: false },
        majorRequired: { required: 28, completed: 0, passed: false },
        majorElective: { required: 42, completed: 0, passed: false },
        liberalRequired: { required: 10, completed: 0, passed: false },
        liberalElective: { required: 20, completed: 0, passed: false },
        foundation: { required: 30, completed: 0, passed: false },
        missingCourses: [],
        recommendations: []
    };

    // 사용자 이수 과목 분석
    const completedCourses = userRecords.filter(record =>
        ['A+', 'A', 'B+', 'B', 'C+', 'C', 'P'].includes(record.grade)
    );

    // 총 학점 계산
    results.totalCredits.completed = completedCourses.reduce((sum, record) =>
        sum + (record.credits || 0), 0
    );
    results.totalCredits.passed = results.totalCredits.completed >= results.totalCredits.required;

    // 전공필수 과목 체크
    const majorRequiredCodes = GRADUATION_REQUIREMENTS.MAJOR.REQUIRED_COURSES.map(course => course.code);
    const completedMajorRequired = completedCourses.filter(record =>
        majorRequiredCodes.includes(record.courseCode)
    );
    results.majorRequired.completed = completedMajorRequired.reduce((sum, record) =>
        sum + (record.credits || 0), 0
    );
    results.majorRequired.passed = results.majorRequired.completed >= results.majorRequired.required;

    // 미이수 전공필수 과목 찾기
    const missingMajorRequired = GRADUATION_REQUIREMENTS.MAJOR.REQUIRED_COURSES.filter(course =>
        !completedCourses.some(record => record.courseCode === course.code)
    );
    results.missingCourses = missingMajorRequired;

    return results;
};

module.exports = {
    GRADUATION_REQUIREMENTS,
    checkGraduationRequirements
}; 