const { UserProfile, Curriculum, CurriculumLecture, Lecture, Professor, Schedule, TimetableSlot, CustomEvent, LectureCode, Records, Sequelize } = require('../models');
const RecordsService = require('./RecordsService'); 
const { Op } = require('sequelize');

class TimetableService {
    // 현재 학기 시간표 조회
    static async getCurrent(userId, semester=null) {
        const whereCondition = { userId };
        if (semester) {
            whereCondition.semesterCode = semester;
        }

        console.log('[DEBUG] getCurrent called with:', { userId, semester });
        console.log('[DEBUG] whereCondition:', whereCondition);

        const schedule = await Schedule.findOne({
            where: whereCondition,
            order: [['updated_at', 'DESC']],
            include: [
                { 
                    model: TimetableSlot, 
                    as: 'TimetableSlots', 
                    required: false,
                    include: [
                        {
                            model: LectureCode,
                            as: 'LectureCode',
                            required: false,
                            attributes: ['id', 'code', 'name']
                        }
                    ]
                },
                { model: CustomEvent, as: 'CustomEvents', required: false }
            ],
            logging: console.log 
        });
        console.log('[DEBUG] getCurrent schedule:', JSON.stringify(schedule, null, 2));
        return schedule;
    }

    // 시간/강의실 파싱
    static parseTimeAndRoom(timeRoomStr) {
        if (!timeRoomStr || typeof timeRoomStr !== 'string') {
            console.warn("[parseTimeAndRoom] Invalid timeRoomStr:", timeRoomStr);
            return [];
        }

        console.log("[parseTimeAndRoom] Input:", timeRoomStr);

        const dayMap = { 
            '월': 'MON', '화': 'TUE', '수': 'WED', 
            '목': 'THU', '금': 'FRI', '토': 'SAT', '일': 'SUN' 
        };
        const results = [];

        const pattern = /(월|화|수|목|금|토|일)\s*\[(\d+)(?:~(\d+))?\]\s*(\d{2}:\d{2})~(\d{2}:\d{2})\s*(?:\(([^)]*)\))?/g;
        
        let match;
        while ((match = pattern.exec(timeRoomStr)) !== null) {
            const [fullMatch, day, startPeriod, endPeriod, startTime, endTime, room] = match;
            
            const result = {
                dayOfWeek: dayMap[day],
                startPeriod: parseInt(startPeriod),
                endPeriod: parseInt(endPeriod || startPeriod),
                startTime: startTime,
                endTime: endTime,
                room: (room || '').trim()
            };
            
            results.push(result);
            console.log("[parseTimeAndRoom] Parsed:", result);
        }

        // 매칭되지 않은 경우 로그 출력
        if (results.length === 0) {
            console.warn("[parseTimeAndRoom] No matches found for:", timeRoomStr);
        }

        return results;
    }

    // Excel 과목 데이터 파싱
    static async parseExcelCourse(excelRow, transaction) {
        try {
            const courseCode = excelRow['강좌번호'] || excelRow['강좌번호▲'] || excelRow['강좌번호▼'];  
            const courseName = excelRow['과목명'] || excelRow['과목명▲'] || excelRow['과목명▼']; 
            const timeRoomStr = excelRow['시간/강의실'] || excelRow['시간/강의실▲'] || excelRow['시간/강의실▼']; 
            const instructor = excelRow['담당교수'] || excelRow['담당교수▲'] || excelRow['담당교수▼'];
            const creditsRaw = excelRow['학점'] || excelRow['학점▲'] || excelRow['학점▼'];
            const credits = creditsRaw ? parseInt(creditsRaw) : null;
            const classification = excelRow['이수구분'] || excelRow['이수구분▲'] || excelRow['이수구분▼'];

            if (!courseCode || !courseName || !credits || isNaN(credits) || 
                courseCode.includes('총건수')) {
                return null;
            }
            
            console.log(`[parseExcelCourse] Processing: ${courseCode} - ${courseName}`);
            console.log(`[parseExcelCourse] Classification: ${classification}, Credits: ${credits}`);
            console.log(`[parseExcelCourse] Time/Room: "${timeRoomStr}"`);

            if (!courseCode || courseCode.includes('총건수') || !courseName || courseName.includes('총건수')) {
                return null;
            }

            // LectureCode 조회
            let lectureCode = await LectureCode.findOne({
                where: { code: courseCode },
                transaction
            });

            // 시간표 정보 파싱
            const timeInfos = this.parseTimeAndRoom(timeRoomStr || '');
            console.log(`[parseExcelCourse] Parsed ${timeInfos.length} time slots:`, timeInfos);

            if (!timeInfos || timeInfos.length === 0) {
                console.warn(`[parseExcelCourse] No time slots parsed for: ${courseName}`);
                return null;
            }

            // 연강 처리
            const mergedTimeInfos = this.mergeConsecutivePeriods(timeInfos);
            
            let commonRoom = mergedTimeInfos.find(info => info.room)?.room || '';
            if (commonRoom) {
                mergedTimeInfos.forEach(info => {
                    if (!info.room) {
                        info.room = commonRoom;
                    }
                });
            }

            return mergedTimeInfos.map(timeInfo => {
                const result = {
                    codeId: lectureCode ? lectureCode.id : null,
                    courseName: courseName.trim(),
                    instructor: instructor || '',
                    credits: credits,
                    type: this.mapCourseTypeCode(classification),
                    dayOfWeek: timeInfo.dayOfWeek,
                    startPeriod: timeInfo.startPeriod,
                    endPeriod: timeInfo.endPeriod,
                    startTime: timeInfo.startTime,
                    endTime: timeInfo.endTime,
                    room: timeInfo.room || '',
                    color: this.generateCourseColor(courseName)
                };
                
                console.log('[parseExcelCourse] Created slot:', {
                    courseName: result.courseName,
                    dayOfWeek: result.dayOfWeek,
                    type: result.type,
                    credits: result.credits,
                    codeId: result.codeId
                });
                
                return result;
            });

        } catch (error) {
            console.error(`[parseExcelCourse] Error processing row:`, error);
            return null;
        }
    }

    
    // ===== 기타 메서드 =====
    static async getBySemester(userId, semester) {
        console.log('[DEBUG] getBySemester where:', { userId, semester });
        const schedule = await Schedule.findOne({
            where: { userId, semesterCode: semester },
            include: [
                { 
                    model: TimetableSlot, 
                    as: 'TimetableSlots', 
                    required: false,
                    include: [
                        {
                            model: LectureCode,
                            as: 'LectureCode',
                            required: false,
                            attributes: ['id', 'code']
                        }
                    ]
                }
            ],
        });
        console.log('[DEBUG] getBySemester result:', schedule);
        return schedule;
    }

    // 연강 처리 함수
    static mergeConsecutivePeriods(timeInfos) {
        if (!timeInfos || timeInfos.length <= 1) return timeInfos;

        const merged = [];
        const grouped = {};

        // 요일별로 그룹핑
        timeInfos.forEach(info => {
            if (!grouped[info.dayOfWeek]) {
                grouped[info.dayOfWeek] = [];
            }
            grouped[info.dayOfWeek].push(info);
        });

        // 각 요일별로 연속된 교시 합치기
        Object.entries(grouped).forEach(([day, infos]) => {
            // 교시 순서로 정렬
            infos.sort((a, b) => a.startPeriod - b.startPeriod);
            
            let current = infos[0];
            
            for (let i = 1; i < infos.length; i++) {
                const next = infos[i];
                
                // 연속된 교시인지 확인
                if (current.endPeriod + 1 === next.startPeriod || current.endPeriod === next.startPeriod) {
                    // 연강으로 합치기
                    current.endPeriod = next.endPeriod;
                    current.endTime = next.endTime;
                    // 강의실이 다르면 둘 다 표시
                    if (next.room && current.room !== next.room) {
                        current.room = current.room ? `${current.room}, ${next.room}` : next.room;
                    }
                } else {
                    // 연속되지 않으면 현재 것을 결과에 추가하고 다음을 current로 설정
                    merged.push(current);
                    current = next;
                }
            }
            
            // 마지막 것 추가
            merged.push(current);
        });

        return merged;
    }

    static mergeConsecutiveSchedule(schedule) {
        if (!schedule || schedule.length <= 1) return schedule;

        const grouped = {};
        schedule.forEach(slot => {
            if (!grouped[slot.day]) grouped[slot.day] = [];
            grouped[slot.day].push(slot);
        });

        const merged = [];
        Object.entries(grouped).forEach(([day, slots]) => {
            slots.sort((a, b) => a.period - b.period);

            let group = [slots[0]];
            for (let i = 1; i < slots.length; i++) {
                if (slots[i].period === slots[i - 1].period + 1) {
                    group.push(slots[i]);
                } else {
                    merged.push(this.buildMergedSlot(group, day));
                    group = [slots[i]];
                }
            }
            merged.push(this.buildMergedSlot(group, day));
        });

        return merged;
    }

    static buildMergedSlot(group, day) {
        const start = group[0];
        const end = group[group.length - 1];
        return {
            day,
            period: start.period,
            startPeriod: start.period,
            endPeriod: end.period,
            start_end: `${start.start_end.split('~')[0]} ~ ${end.start_end.split('~')[1]}`
        };
    }

    // 이수구분 매핑 함수 ac
    static mapCourseTypeCode(classification) {
        const typeMap = {
            '교필': 'GR',
            '교선': 'GE',
            '전필': 'MR',
            '전선': 'ME',
            '현장연구': 'RE',
            '자선': 'FE'
        };
        return typeMap[classification] || 'GE';
    }

    // 색상 배정 함수
    static assignSemesterColors(slots) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#ffde74ff',
                        '#DDA0DD', '#98D8E8', '#ffb65eff', '#BB8FCE', '#85C1E9'];
        const courseColorMap = {};
        let colorIndex = 0;

        slots.forEach(slot => {
            if (!courseColorMap[slot.courseName]) {
                courseColorMap[slot.courseName] = colors[colorIndex % colors.length];
                colorIndex++;
            }
            slot.color = courseColorMap[slot.courseName];
        });

        return slots;
    }

    static async create(userId, { semesterCode, year, courses }) {
        const transaction = await Schedule.sequelize.transaction();
        try {
            const schedule = await Schedule.create(
                { userId, semesterCode, year: year || new Date().getFullYear() },
                { transaction }
            );

            let validSlots = [];
            for (const course of courses) {
                if (course['강좌번호'] !== undefined || course['과목명'] !== undefined) {
                    const parsed = await this.parseExcelCourse(course, transaction);
                    if (parsed) validSlots.push(...parsed.map(s => ({ scheduleId: schedule.id, ...s })));

                } else if (course.codeId || (course.courseName && course.dayOfWeek)) {
                    validSlots.push({ scheduleId: schedule.id, ...course });

                } else if (course.name && Array.isArray(course.schedule)) {
                    for (const slot of course.schedule) {
                        const startPeriod = slot.startPeriod ?? slot.period;
                        const endPeriod = slot.endPeriod ?? slot.period;

                        validSlots.push({
                            scheduleId: schedule.id,
                            courseName: course.name,
                            codeId: course.code_id ?? null,
                            instructor: course.professor,
                            credits: course.credits,
                            room: course.room,
                            type: course.type,
                            dayOfWeek: slot.day,
                            startPeriod,
                            endPeriod,
                            startTime: slot.start_end?.split("~")[0]?.trim(),
                            endTime: slot.start_end?.split("~")[1]?.trim(),
                        });
                    }

                } else {
                    const parsed = await this.parseCourse(course);
                    if (parsed) validSlots.push({ scheduleId: schedule.id, ...parsed });
                }
            }

            validSlots = this.assignSemesterColors(validSlots);

            if (validSlots.length > 0) {
                await TimetableSlot.bulkCreate(validSlots, { transaction, validate: true });
            }

            await transaction.commit();

            await RecordsService.convertTimetableToRecords({
                userId,
                semester: semesterCode,
                overwrite: true
            });

            return this.getScheduleById(schedule.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async update(userId, scheduleId, { semesterCode, year, courses }) {
        const transaction = await Schedule.sequelize.transaction();
        try {
            const schedule = await Schedule.findOne({ 
                where: { id: scheduleId, userId }, 
                transaction 
            });
            
            if (!schedule) throw new Error('Timetable not found');

            // 기존 슬롯 삭제
            await TimetableSlot.destroy({ where: { scheduleId }, transaction });

            let slots = [];
            for (const course of courses) {
                if (course['강좌번호'] !== undefined || course['과목명'] !== undefined) {
                    const parsed = await this.parseExcelCourse(course, transaction);
                    if (parsed) slots.push(...parsed.map(p => ({ scheduleId: schedule.id, ...p })));

                } else if (course.codeId || (course.courseName && course.dayOfWeek)) {
                    slots.push({ scheduleId: schedule.id, ...course });

                } else if (course.name && Array.isArray(course.schedule)) {
                    let codeId = null;
                    if (course.code_id) {
                        const lectureCode = await LectureCode.findOne({
                            where: { code: course.code_id },
                            transaction
                        });
                        if (lectureCode) {
                            codeId = lectureCode.id;
                        } else {
                            console.warn("[update] 강의 코드를 찾을 수 없습니다:", course.code_id);
                        }
                    }

                    for (const slot of course.schedule) {
                        const startPeriod = slot.startPeriod ?? slot.period;
                        const endPeriod = slot.endPeriod ?? slot.period;

                        slots.push({
                            scheduleId: schedule.id,
                            courseName: course.name,
                            codeId,
                            instructor: course.professor,
                            credits: course.credits,
                            room: course.room,
                            type: course.type,
                            dayOfWeek: slot.day,
                            startPeriod,
                            endPeriod,
                            startTime: slot.start_end?.split("~")[0]?.trim(),
                            endTime: slot.start_end?.split("~")[1]?.trim(),
                        });
                    }

                } else {
                    const parsed = await this.parseCourse(course);
                    if (parsed) slots.push({ scheduleId: schedule.id, ...parsed });
                }
            }

            slots = this.assignSemesterColors(slots);

            if (slots.length > 0) {
                await TimetableSlot.bulkCreate(slots, { transaction, validate: true });
            }

            schedule.updated_at = new Date();
            await schedule.save({ transaction });

            await transaction.commit();

            await RecordsService.convertTimetableToRecords({
                userId,
                semester: semesterCode,
                overwrite: true
            });

            return this.getScheduleById(schedule.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async delete(userId, identifier, type = 'id') {
        const transaction = await Schedule.sequelize.transaction();
        try {
            let schedule;
            
            if (type === 'semester') {
                schedule = await Schedule.findOne({ 
                    where: { userId, semesterCode: identifier }, 
                    transaction 
                });
            } else {
                schedule = await Schedule.findOne({ 
                    where: { id: identifier, userId }, 
                    transaction 
                });
            }
            
            if (!schedule) return false;

            const semesterCode = schedule.semesterCode;

            const recordsToDelete = await Records.findAll({
                where: { 
                    userId, 
                    semester: semesterCode
                },
                attributes: ['courseCode'],
                transaction
            });
            
            const courseCodes = recordsToDelete.map(r => r.courseCode).filter(Boolean);

            await TimetableSlot.destroy({ where: { scheduleId: schedule.id }, transaction });
            await CustomEvent.destroy({ where: { scheduleId: schedule.id }, transaction });
            await Records.destroy({
                where: { 
                    userId, 
                    semester: semesterCode
                },
                transaction
            });

            if (courseCodes.length > 0) {
                const profile = await UserProfile.findOne({
                    where: { userId },
                    attributes: ['grade', 'semester'],
                    transaction
                });
                
                const currentGrade = profile?.grade || 1;
                const currentSem = profile?.semester || 1;
                
                const [year, semesterNum] = semesterCode.split('-');
                const deletedSem = parseInt(semesterNum);
                const deletedGrade = currentGrade;
                
                let newStatus;
                if (deletedGrade < currentGrade || (deletedGrade === currentGrade && deletedSem < currentSem)) {
                    newStatus = 'off-track';
                } else {
                    newStatus = 'planned';
                }

                const userCurriculums = await Curriculum.findAll({
                    where: { userId },
                    attributes: ['id'],
                    transaction
                });
                
                if (userCurriculums.length > 0) {
                    const curriculumIds = userCurriculums.map(c => c.id);
                    
                    const lectureCodes = await LectureCode.findAll({
                        where: { code: { [Op.in]: courseCodes } },
                        attributes: ['id'],
                        transaction
                    });
                    
                    const lectureCodeIds = lectureCodes.map(lc => lc.id);
                    
                    if (lectureCodeIds.length > 0) {
                        await CurriculumLecture.update(
                            { status: newStatus },
                            {
                                where: {
                                    curri_id: { [Op.in]: curriculumIds },
                                    lect_id: { [Op.in]: lectureCodeIds }
                                },
                                transaction
                            }
                        );
                    }
                }
            }

            await schedule.destroy({ transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async deleteCourse(userId, semesterCode, slotId) {
        const transaction = await Schedule.sequelize.transaction();
        try {
            // 1. 삭제할 슬롯 조회
            const slot = await TimetableSlot.findOne({
                where: { id: slotId },
                include: [{ model: LectureCode, as: 'LectureCode', attributes: ['id', 'code'] }],
                transaction
            });

            if (!slot) {
                throw new Error('해당 슬롯을 찾을 수 없습니다.');
            }

            const codeId = slot.codeId;
            const lectureCode = slot.LectureCode?.code || null;
            const courseName = slot.courseName;

            // 2. 학기 schedule 조회
            const schedule = await Schedule.findOne({
                where: { userId, semesterCode },
                transaction
            });

            if (!schedule) {
                throw new Error('해당 학기의 시간표를 찾을 수 없습니다.');
            }

            // 3. 동일 학기, 동일 codeId/courseName의 모든 slot 삭제
            const whereSlot = { scheduleId: schedule.id };
            if (codeId) {
                whereSlot.codeId = codeId;
            } else {
                whereSlot.courseName = courseName;
            }

            const deletedSlots = await TimetableSlot.destroy({
                where: whereSlot,
                transaction
            });

            // 4. Records 해당 과목만 삭제
            const whereRecord = { userId, semester: semesterCode };
            if (lectureCode) {
                whereRecord.courseCode = lectureCode;
            } else {
                whereRecord.courseName = courseName;
            }

            const deletedRecords = await Records.destroy({
                where: whereRecord,
                transaction
            });

            await transaction.commit();
            return { deletedSlots, deletedRecords };
        } catch (error) {
            await transaction.rollback();
            console.error('[TimetableService] deleteCourse error:', error);
            throw error;
        }
    }

    static async getAll(userId) {
        const schedules = await Schedule.findAll({
            where: { userId },
            order: [['created_at', 'DESC']],
            include: [
                { model: TimetableSlot, as: 'TimetableSlots', required: false },
                { model: CustomEvent, as: 'CustomEvents', required: false }
            ]
        });
        return schedules.map(s);
    }

    static async save(userId, { semesterCode, slots = [], events = [] }) {
        const schedule = await Schedule.create({ userId, semesterCode });
        const slotRecords = slots.map(s => ({ ...s, scheduleId: schedule.id }));
        const eventRecords = events.map(e => ({ ...e, scheduleId: schedule.id }));
        if (slotRecords.length) await TimetableSlot.bulkCreate(slotRecords);
        if (eventRecords.length) await CustomEvent.bulkCreate(eventRecords);
        return this.getScheduleById(schedule.id);
    }

    static async getHistory(userId) {
        return Schedule.findAll({
            where: { userId },
            order: [['created_at', 'DESC']],
            attributes: ['id', 'semesterCode', 'createdAt', 'updatedAt']
        });
    }

    static async getScheduleById(id) {
    const schedule = await Schedule.findByPk(id, {
        include: [
            { 
                model: TimetableSlot, 
                as: 'TimetableSlots', 
                required: false,
                include: [
                    {
                        model: LectureCode,
                        as: 'LectureCode',
                        required: false,
                        attributes: ['id', 'code']
                    }
                ]
            },
            { model: CustomEvent, as: 'CustomEvents', required: false }
        ]
    });
    return schedule;
}

    static generateCourseColor(courseName) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                        '#DDA0DD', '#98D8E8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
        let hash = 0;
        for (let i = 0; i < courseName.length; i++) {
            hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    static async parseCourse(rawCourse) {
        const codeId = rawCourse.code || rawCourse.id || null;
        let credits = rawCourse.credits || 3;
        let type = rawCourse.type || 'GE';

        if (codeId) {
            const lectureCode = await LectureCode.findByPk(codeId);
            if (lectureCode) {
                credits = lectureCode.credits;
                type = lectureCode.type;
            }
        }

        const subject = (rawCourse.name || "").replace(/\[.*?\]/, "").replace(/\(.*?\)/, "").trim();
        return {
            codeId,
            courseName: subject,
            instructor: rawCourse.instructor || "",
            dayOfWeek: rawCourse.day,
            startPeriod: rawCourse.startPeriod || 1,
            endPeriod: rawCourse.endPeriod || 1,
            startTime: rawCourse.startTime || "09:00",
            endTime: rawCourse.endTime || "10:30",
            room: rawCourse.room || "",
            credits,
            type
        };
    }
    
    // 커리큘럼 기반 시간표 자동 생성
    static async generateTimetables(userId, curriculumId, preferences = {}, excludeGenerated = []) {
        try {
            const userProfile = await this.getUserProfile(userId);
            const curriculumLectures = await this.getCurriculumLectures(curriculumId, userProfile);
            console.log('[DEBUG] curriculumLectures:', curriculumLectures)

            const availableLectures = await this.findMatchingLectures(curriculumLectures);
            
            const validTimetables = await this.generateValidCombinations(
                availableLectures, 
                preferences,
                excludeGenerated,
                curriculumLectures
            );

            const mergedTimetables = validTimetables.map(timetable => ({
                ...timetable,
                lectures: timetable.lectures.map(lec => ({
                    ...lec,
                    schedule: this.mergeConsecutiveSchedule(lec.schedule)
                }))
            }));
            
            const scoredTimetables = this.scoreAndRankTimetables(mergedTimetables, preferences);
            
            return scoredTimetables.slice(0, 5);
            
        } catch (error) {
            console.error('시간표 생성 에러:', error);
            throw new Error('시간표 생성 중 오류가 발생했습니다.');
        }
    }

    // 새로운 시간표 조합 생성
    static async refreshTimetables(userId, curriculumId, preferences = {}, excludeGenerated = []) {
        return await this.generateTimetables(userId, curriculumId, preferences, excludeGenerated);
    }

    // 사용자 프로필 정보 조회
    static async getUserProfile(userId) {
        const profile = await UserProfile.findOne({
            where: { userId },
            attributes: ['grade', 'semester', 'major', 'max_credits_per_term']
        });
        return profile;
    }

    // 커리큘럼에서 현재 학기 수강 과목 조회
    static async getCurriculumLectures(curriculumId, userProfile) {
        console.log('[DEBUG] userProfile:', userProfile);
        console.log('[DEBUG] curriculumId:', curriculumId);
        const lectures = await CurriculumLecture.findAll({
            where: {
            curri_id: curriculumId,
            grade: userProfile.grade,
            semester: userProfile.semester.toString(),
            status: { [Op.in]: ['planned', 'current', '', null] }
            },
            order: [['type'], ['name']]
        });
        return lectures;
    }

    // 커리큘럼 과목과 실제 강의 매칭
    static async findMatchingLectures(curriculumLectures) {
        const lectureGroups = {};
        const notFoundLectures = []; 
        
        for (const curriLecture of curriculumLectures) {
            const lectures = await Lecture.findAll({
                where: {
                    year: 2025,
                    semester: '2',
                    code_id: curriLecture.lect_id
                },
                include: [
                    { model: Professor, as: 'Professor', attributes: ['name'] },
                    { model: LectureCode, as: 'LectureCode', attributes: ['id', 'code', 'type'] }
                ],
                order: [[{ model: Professor, as: 'Professor' }, 'name']]
            });

            if (lectures.length > 0) {
                console.log(`[MATCH] ${curriLecture.name} (${curriLecture.lect_id}) → ${lectures.length}개 매칭됨`);
                lectureGroups[curriLecture.name] = lectures.map(lecture => ({
                    id: lecture.id,
                    code_id: lecture.code_id,
                    code: lecture.LectureCode?.code || String(lecture.code_id),
                    type: lecture.LectureCode?.type || 'GE',
                    name: lecture.name,
                    professor: lecture.Professor?.name || '미배정',
                    schedule: this.parseSchedule(lecture.schedule),
                    room: lecture.room,
                    max_students: lecture.max_students,
                    team_project: lecture.team_project === 'Y',
                    grade: lecture.grade,
                    semester: lecture.semester,
                    credits: curriLecture.credits
                }));
            } else {
                console.warn(`[NOT FOUND] ${curriLecture.name} (${curriLecture.lect_id}) → 매칭 없음`);
                notFoundLectures.push({
                    name: curriLecture.name,
                    lect_id: curriLecture.lect_id,
                    credits: curriLecture.credits,
                    grade: curriLecture.grade,
                    semester: curriLecture.semester
                });
            }
            if (notFoundLectures.length > 0) {
                console.log("[DEBUG] 매칭되지 않은 강의 목록: ");
                notFoundLectures.forEach(l =>
                    console.log(`- ${l.name} (lect_id=${l.lect_id}, ${l.grade}학년 ${l.semester}학기, ${l.credits}학점)`)
                );
            }
        }
        return lectureGroups;
    }

    // JSON 스케줄 데이터 파싱
    static parseSchedule(scheduleJson) {
        try {
            if (!scheduleJson) return [];

            const parsed = typeof scheduleJson === 'string'
                ? JSON.parse(scheduleJson)
                : scheduleJson;

            console.log('[DEBUG parseSchedule] Input:', scheduleJson);
            console.log('[DEBUG parseSchedule] Parsed:', parsed);

            const timeSlots = [];

            for (const slot of parsed) {
                const day = this.mapDayToFrontend(slot.day);
                
                // time 필드 처리 개선
                let periods = [];
                if (slot.time.includes('~')) {
                    const [start, end] = slot.time.split('~').map(Number);
                    for (let period = start; period <= end; period++) {
                        periods.push(period);
                    }
                } else {
                    periods.push(parseInt(slot.time, 10));
                }

                for (const period of periods) {
                    timeSlots.push({
                        day,
                        period,
                        start_end: slot.start_end || ''
                    });
                }
            }

            console.log('[DEBUG parseSchedule] Result:', timeSlots);
            return timeSlots;
        } catch (error) {
            console.error('스케줄 파싱 에러:', error);
            return [];
        }
    }

    static mapDayToFrontend(day) {
        const map = {
            '월': 'monday',
            '화': 'tuesday',
            '수': 'wednesday',
            '목': 'thursday',
            '금': 'friday',
            '토': 'saturday',
            '일': 'sunday'
        };
        return map[day] || (day?.toLowerCase?.() || '');
    }

    // 유효한 시간표 조합 생성
    static async generateValidCombinations(
        lectureGroups,
        preferences,
        excludeGenerated = [],
        curriculumLectures = []
    ) {
        const subjectNames = Object.keys(lectureGroups);
        const lectureOptions = subjectNames.map(name => lectureGroups[name]);
        const validTimetables = [];
        let attemptCount = 0;

        const backtrack = (index, currentCombination) => {
            if (index === lectureOptions.length) {
                attemptCount++;
                if (attemptCount % 1000 === 0) {
                    console.log(`[DEBUG] ${attemptCount}번째 조합 시도 중...`);
                }

                if (this.isValidTimetable(currentCombination, preferences, curriculumLectures)) {
                    const timetableId = this.generateTimetableId(currentCombination);

                    if (!excludeGenerated.includes(timetableId)) {
                        validTimetables.push({
                            id: timetableId,
                            lectures: [...currentCombination]
                        });
                    }
                }
                return;
            }

            for (const lecture of lectureOptions[index]) {
                if (!this.hasTimeConflict(currentCombination, lecture)) {
                    currentCombination.push(lecture);
                    backtrack(index + 1, currentCombination);
                    currentCombination.pop();
                }
            }
        };

        backtrack(0, []);

        // 모든 조합 반환
        return validTimetables;
    }

    // 각 강의의 충돌 가능성 점수 계산
    static calculateLectureConflictScore(lecture, lectureGroups, currentSubject) {
        let conflictScore = 0;
        
        // 다른 과목들의 모든 강의와 비교
        Object.entries(lectureGroups).forEach(([subjectName, lectures]) => {
            if (subjectName === currentSubject) return;
            
            lectures.forEach(otherLecture => {
                if (this.hasTimeConflict([lecture], otherLecture)) {
                    conflictScore += 10;
                }
            });
        });
        
        // 야간 강의
        const hasEveningClass = lecture.schedule.some(slot => slot.period >= 9);
        if (hasEveningClass) conflictScore -= 20;
        
        // 금요일 강의
        const hasFridayClass = lecture.schedule.some(slot => slot.day === 'friday');
        if (hasFridayClass) conflictScore -= 10;
        
        return conflictScore;
    }

    static hasTimeConflict(lectures, newLecture) {
        for (const newSlot of newLecture.schedule) {
            for (const lecture of lectures) {
                for (const existingSlot of lecture.schedule) {
                    if (newSlot.day !== existingSlot.day) continue;
                    
                    if (newSlot.period === existingSlot.period) {
                        console.log(`[DETAIL] 충돌 상세:`, {
                            new: `${newLecture.name} - ${newSlot.day} ${newSlot.period}교시`,
                            existing: `${lecture.name} - ${existingSlot.day} ${existingSlot.period}교시`,
                            newSchedule: newLecture.schedule,
                            existingSchedule: lecture.schedule
                        });
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // 시간표 고유 ID 생성
    static generateTimetableId(lectures) {
        const ids = lectures.map(lecture => lecture.id).sort().join('-');
        return Buffer.from(ids).toString('base64').slice(0, 16);
    }

    // 강의 추가 가능 여부 확인
    static canAddLecture(currentLectures, newLecture, preferences, lectureGroups) {
        if (this.hasTimeConflict(currentLectures, newLecture)) {
            return false;
        }

        const isCurriculumLecture = !!lectureGroups[newLecture.name];
        if (isCurriculumLecture) {
            return true;
        }

        if (preferences.avoid_professors?.includes(newLecture.professor)) {
            const alternatives = lectureGroups[newLecture.name]?.filter(
                l => l.professor !== newLecture.professor
            );
            if (alternatives && alternatives.length > 0) {
                return false;
            }
        }
        
        if (!this.checkTimePreferences(newLecture, preferences)) {
            const alternatives = lectureGroups[newLecture.name]?.filter(
                l => this.checkTimePreferences(l, preferences)
            );
            if (alternatives && alternatives.length > 0) {
                return false;
            }
        }
        
        return true;
    }

    // 시간대 선호도 확인
    static checkTimePreferences(lecture, preferences) {
        for (const slot of lecture.schedule) {
            // 1교시 제외
            if (preferences.exclude_morning && slot.period === 1) {
                return false;
            }
            
            // 저녁 수업 제외 (12-14교시)
            if (preferences.exclude_evening && [12, 13, 14].includes(slot.period)) {
                return false;
            }
        }
        return true;
    }

    // 시간표 전체 유효성 검사
    static isValidTimetable(lectures, preferences, curriculumLectures = []) {
        const matchedLectureIds = new Set(lectures.map(lec => lec.code_id));

        const requiredCredits = curriculumLectures
            .filter(curri => matchedLectureIds.has(curri.lect_id))
            .reduce((sum, curri) => sum + curri.credits, 0);

        const totalCredits = lectures.reduce((sum, lec) => sum + lec.credits, 0);

        if (requiredCredits > 0 && totalCredits < requiredCredits) {
            console.log(`[INVALID] 학점 부족: ${totalCredits}/${requiredCredits}`);
            return false;
        }

        console.log(`[VALID] 모든 검증 통과 - 학점: ${totalCredits}`);
        return true;
    }

    // 요일별 강의 그룹핑
    static groupByDay(lectures) {
        const dailySchedule = {};
        
        for (const lecture of lectures) {
            for (const slot of lecture.schedule) {
                if (!dailySchedule[slot.day]) {
                dailySchedule[slot.day] = [];
                }
                
                if (!dailySchedule[slot.day].includes(lecture)) {
                dailySchedule[slot.day].push(lecture);
                }
            }
        }
        
        return dailySchedule;
    }

    // 시간표 점수 계산 및 정렬
    static scoreAndRankTimetables(timetables, preferences) {
        const scoredTimetables = timetables.map(timetable => {
            const score = this.calculateTimetableScore(timetable.lectures, preferences);

            return {
                id: timetable.id,
                score,
                lectures: timetable.lectures.map(lecture => ({
                    id: lecture.id,
                    code_id: lecture.code_id,
                    code: lecture.code,
                    name: lecture.name,
                    professor: lecture.professor,
                    credits: lecture.credits,
                    room: lecture.room,
                    schedule: lecture.schedule,
                    team_project: lecture.team_project,
                    type: lecture.type
                })),
                summary: this.generateTimetableSummary(timetable.lectures)
            };
        });

        const sorted = scoredTimetables.sort((a, b) => b.score - a.score);
        const timetableMap = new Map();

        for (const t of sorted) {
            const pattern = t.lectures
                .flatMap(l => l.schedule.map(s => `${s.day}${s.period}`))
                .sort()
                .join('|');

            if (!timetableMap.has(pattern)) {
                timetableMap.set(pattern, { ...t, lectures: [...t.lectures] });
            } else {
                const existing = timetableMap.get(pattern);
                existing.lectures.forEach((lec, idx) => {
                    const other = t.lectures[idx];
                    if (other && lec.professor !== other.professor) {
                        // 같은 과목일 때 교수명 합치기
                        if (!lec.professor.includes(other.professor)) {
                            lec.professor = `${lec.professor}/${other.professor}`;
                        }
                    }
                });
            }
        }

        // 상위 5개만 반환
        return Array.from(timetableMap.values()).slice(0, 5);
    }

    // 개선된 시간표 점수 계산
    static calculateTimetableScore(lectures, preferences) {
        let score = 100;

        // 총 학점
        const totalCredits = lectures.reduce((sum, lec) => sum + lec.credits, 0);
        if (totalCredits >= 18) score += 10;
        else if (totalCredits < 15) score -= 10;

        // 선호 교수
        if (preferences.preferred_professors) {
            for (const lecture of lectures) {
                if (preferences.preferred_professors.includes(lecture.professor)) {
                    score += 10;
                }
            }
        }

        // 비선호 교수
        if (preferences.avoid_professors) {
            for (const lecture of lectures) {
                if (preferences.avoid_professors.includes(lecture.professor)) {
                    score -= 15;
                }
            }
        }

        // 팀프로젝트 과목
        const teamProjectCount = lectures.filter(lecture => lecture.team_project).length;
        score -= teamProjectCount * 8;

        // 요일 분산도
        const dailySchedule = this.groupByDay(lectures);
        const occupiedDays = Object.keys(dailySchedule).length;
        const idealDays = 3;
        const distributionPenalty = Math.abs(occupiedDays - idealDays) * 3;
        score -= distributionPenalty;

        // 공강일 반영
        if (preferences.free_days) {
            const occupiedDaysSet = new Set(Object.keys(dailySchedule));
            const freeDayBonus = preferences.free_days
                .filter(day => !occupiedDaysSet.has(day.toLowerCase()))
                .length * 7;
            score += freeDayBonus;
        }

        // 시간대 선호도
        let timePreferenceBonus = 0;
        for (const lecture of lectures) {
            for (const slot of lecture.schedule) {
                if (preferences.exclude_morning && slot.period === 1) {
                    timePreferenceBonus -= 5;
                }
                if (preferences.exclude_evening && slot.period >= 12) {
                    timePreferenceBonus -= 5;
                }
                if (slot.period === 4) {
                    timePreferenceBonus -= 2;
                }
                if ([3, 5, 6, 7].includes(slot.period)) {
                    timePreferenceBonus += 2;
                }
            }
        }
        score += timePreferenceBonus;

        // 하루 연강 제한 
        if (preferences.max_consecutive_hours) {
            for (const [day, dayLectures] of Object.entries(dailySchedule)) {
                const periods = [];
                for (const lecture of dayLectures) {
                    for (const slot of lecture.schedule) {
                        if (slot.day === day) {
                            periods.push(slot.period);
                        }
                    }
                }
                if (periods.length > 0) {
                    periods.sort((a, b) => a - b);
                    const consecutiveHours = periods[periods.length - 1] - periods[0] + 1;
                    if (consecutiveHours > preferences.max_consecutive_hours) {
                        score -= (consecutiveHours - preferences.max_consecutive_hours) * 5;
                    }
                }
            }
        }

        return Math.max(score, 0);
    }

    // 시간표 요약 정보 생성
    static generateTimetableSummary(lectures) {
        const dailySchedule = this.groupByDay(lectures);
        
        return {
            total_lectures: lectures.length,
            total_credits: lectures.reduce((sum, lecture) => sum + lecture.credits, 0),
            occupied_days: Object.keys(dailySchedule),
            team_projects: lectures.filter(lecture => lecture.team_project).map(lecture => lecture.name),
            professors: [...new Set(lectures.map(lecture => lecture.professor))]
        };
    }

    // 시간표 저장
    static async saveTimetable(userId, timetable, semesterCode, { isGenerated = false } = {}) {
        const transaction = await Schedule.sequelize.transaction();
        try {
            // 현재 학기 스케줄 조회 또는 생성
            let schedule = await Schedule.findOne({
                where: { userId, semesterCode },
                transaction
            });

            if (!schedule) {
                schedule = await Schedule.create({
                    userId,
                    semesterCode,
                    year: new Date().getFullYear(),
                }, { transaction });
            }

            // 기존 슬롯 삭제
            await TimetableSlot.destroy({
                where: { scheduleId: schedule.id },
                transaction
            });

            // 새로운 슬롯 생성
            const lectures = timetable.lectures || timetable.courses || [];
            let slots = []; 

            const courseColorMap = {};
            const usedColors = await TimetableSlot.findAll({
                where: { scheduleId: schedule.id },
                attributes: ['courseName', 'color'],
                raw: true,
                transaction
            }).then(rows => {
                const colors = [];
                rows.forEach(r => {
                    if (r.courseName && r.color) {
                        courseColorMap[r.courseName] = r.color;
                        colors.push(r.color);
                    }
                });
                return colors;
            });

            for (const lecture of lectures) {
                if (!lecture.schedule || lecture.schedule.length === 0) continue;

                const schedules = isGenerated
                    ? lecture.schedule
                    : this.mergeConsecutiveSchedule(lecture.schedule);

                for (const slot of schedules) {
                    if (!slot.day) {
                        console.warn("[saveTimetable] slot.day is missing:", slot);
                        continue;
                    }

                    const startPeriod = slot.startPeriod ?? slot.period;
                    const endPeriod = slot.endPeriod ?? slot.period;

                    const [startTime, endTime] = slot.start_end
                        ? slot.start_end.split("~").map(s => s.trim())
                        : [
                            this.periodToTime(startPeriod).start,
                            this.periodToTime(endPeriod).end
                        ];


                    let codeId = null;
                    if (lecture.code_id) {
                        if (typeof lecture.code_id === 'number') {
                            codeId = lecture.code_id;
                        } else {
                            const lectureCode = await LectureCode.findOne({
                                where: { code: lecture.code_id },
                                transaction
                            });
                            if (lectureCode) {
                                codeId = lectureCode.id;
                            } else {
                                console.warn("[saveTimetable] LectureCode not found:", lecture.code_id);
                                codeId = null;
                            }
                        }
                    }
                    
                    slots.push({
                        scheduleId: schedule.id,
                        courseName: lecture.name,
                        instructor: lecture.professor,
                        credits: lecture.credits,
                        room: lecture.room || '',
                        dayOfWeek: this.mapDayToDatabase(slot.day),
                        startPeriod,
                        endPeriod,
                        startTime,
                        endTime,
                        type: lecture.type || 'ME',
                        codeId,
                        color: this.assignUniqueColor(lecture.name, courseColorMap, usedColors)
                    });
                }
            }

            if (slots.length > 0) {
                await TimetableSlot.bulkCreate(slots, { transaction, validate: true });
            }

            await transaction.commit();
            return this.getScheduleById(schedule.id);
        } catch (error) {
            await transaction.rollback();
            console.error("[saveTimetable] Error:", error);
            throw error;
        }
    }

    // 헬퍼 메서드들
    static assignUniqueColor(courseName, courseColorMap, usedColors) {
        const palette = [
            '#FF6B6B','#4ECDC4','#45B7D1','#96CEB4',
            '#FFEAA7','#DDA0DD','#98D8E8','#F7DC6F',
            '#BB8FCE','#85C1E9'
        ];

        if (courseColorMap[courseName]) {
            return courseColorMap[courseName];
        }

        const unused = palette.find(c => !usedColors.includes(c));
        if (unused) {
            courseColorMap[courseName] = unused;
            usedColors.push(unused);
            return unused;
        }

        const generated = this.generateCourseColor(courseName);
        courseColorMap[courseName] = generated;
        return generated;
    }

    static mapDayToDatabase(day) {
        const dayMap = {
            'monday': 'MON', 'tuesday': 'TUE', 'wednesday': 'WED',
            'thursday': 'THU', 'friday': 'FRI', 'saturday': 'SAT', 'sunday': 'SUN',
            'MON': 'MON', 'TUE': 'TUE', 'WED': 'WED',
            'THU': 'THU', 'FRI': 'FRI', 'SAT': 'SAT', 'SUN': 'SUN'
        };
        return dayMap[day] || day;
    }

    static periodToTime(period) {
        const timeMap = {
            1: { start: '09:30:00', end: '10:20:00' },
            2: { start: '10:30:00', end: '11:20:00' },
            3: { start: '11:30:00', end: '12:20:00' },
            4: { start: '12:30:00', end: '13:20:00' },
            5: { start: '13:30:00', end: '14:20:00' },
            6: { start: '14:30:00', end: '15:20:00' },
            7: { start: '15:30:00', end: '16:20:00' },
            8: { start: '16:30:00', end: '17:20:00' },
            9: { start: '17:25:00', end: '18:15:00' },
            10: { start: '18:15:00', end: '19:05:00' },
            11: { start: '19:05:00', end: '19:55:00' },
            12: { start: '20:00:00', end: '20:50:00' },
            13: { start: '20:50:00', end: '21:40:00' },
            14: { start: '21:40:00', end: '22:30:00' },            
        };
        return timeMap[period] || { start: '09:30:00', end: '10:20:00' };
    }

    // 시간표 생성 조건 옵션 조회
    static async getPreferenceOptions() {
        return {
        days: [
            { value: 'monday', label: '월요일' },
            { value: 'tuesday', label: '화요일' },
            { value: 'wednesday', label: '수요일' },
            { value: 'thursday', label: '목요일' },
            { value: 'friday', label: '금요일' }
        ],
        periods: [
            { value: 1, label: '1교시 (09:30~10:20)' },
            { value: 2, label: '2교시 (10:30~11:20)' },
            { value: 3, label: '3교시 (11:30~12:20)' },
            { value: 4, label: '4교시 (12:30~13:20)' },
            { value: 5, label: '5교시 (13:30~14:20)' },
            { value: 6, label: '6교시 (14:30~15:20)' },
            { value: 7, label: '7교시 (15:30~16:20)' },
            { value: 8, label: '8교시 (16:30~17:20)' },
            { value: 9, label: '9교시 (17:25~18:15)' },
            { value: 10, label: '10교시 (18:15~19:05)' },
            { value: 11, label: '11교시 (19:05~19:55)' },
            { value: 12, label: '12교시 (20:00~20:50)' },
            { value: 13, label: '13교시 (20:50~21:40)' },
            { value: 14, label: '14교시 (21:40~22:30)' }
        ],
        maxDailyClasses: [1, 2, 3, 4, 5],
        maxConsecutiveHours: [2, 3, 4, 5, 6, 7, 8]
        };
    }
}

module.exports = TimetableService;