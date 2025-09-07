const { Schedule, TimetableSlot, CustomEvent, LectureCode, Sequelize } = require('../models');

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

    // 이수구분 매핑 함수
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

            // 새 슬롯 생성
            let slots = [];
            for (const course of courses) {
                if (course['강좌번호'] !== undefined || course['과목명'] !== undefined) {
                    const parsed = await this.parseExcelCourse(course, transaction);
                    if (parsed) slots.push(...parsed.map(p => ({ scheduleId: schedule.id, ...p })));
                } else if (course.codeId || (course.courseName && course.dayOfWeek)) {
                    slots.push({ scheduleId: schedule.id, ...course });
                } else {
                    const parsed = await this.parseCourse(course);
                    if (parsed) slots.push({ scheduleId: schedule.id, ...parsed });
                }
            }

            slots = this.assignSemesterColors(slots);

            if (slots.length > 0) {
                await TimetableSlot.bulkCreate(slots, { transaction });
            }

            const result = await Schedule.sequelize.query(
                'UPDATE schedules SET updated_at = NOW() WHERE id = ? AND user_id = ?',
                {
                    replacements: [scheduleId, userId],
                    type: Schedule.sequelize.QueryTypes.UPDATE,
                    transaction
                }
            );
            console.log('Direct SQL result:', result);

            await transaction.commit();
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

            await TimetableSlot.destroy({ where: { scheduleId: schedule.id }, transaction });
            await CustomEvent.destroy({ where: { scheduleId: schedule.id }, transaction });
            await schedule.destroy({ transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
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
}

module.exports = TimetableService;