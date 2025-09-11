'use strict';

const { Records, Review, Schedule, TimetableSlot, LectureCode } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

module.exports = {
    /**
     * 시간표를 수강내역으로 변환
     */
    async convertTimetableToRecords({ userId, semester, overwrite = false }) {
        const transaction = await sequelize.transaction();
        
        try {
            // 1. 기존 수강내역 확인
            const existingRecords = await Records.findAll({
                where: { userId, semester },
                transaction
            });

            // 기존 성적 맵핑
            const gradeMap = {};
            for (const rec of existingRecords) {
                if (rec.courseCode) {
                    gradeMap[rec.courseCode] = rec.grade; // 같은 code면 성적 유지
                }
            }

            if (existingRecords.length > 0 && !overwrite) {
                throw new Error('이미 해당 학기의 수강내역이 존재합니다.');
            }

            // 2. 시간표 데이터 조회
            const schedule = await Schedule.findOne({
                where: { userId, semesterCode: semester },
                include: [
                    {
                        model: TimetableSlot,
                        as: 'TimetableSlots',
                        include: [
                            {
                                model: LectureCode,
                                as: 'LectureCode',
                                required: false
                            }
                        ]
                    }
                ],
                transaction
            });

            if (!schedule || !schedule.TimetableSlots || schedule.TimetableSlots.length === 0) {
                throw new Error('해당 학기의 시간표 데이터가 없습니다.');
            }

            // 3. 기존 수강내역 삭제
            if (existingRecords.length > 0 && overwrite) {
                await Records.destroy({
                    where: { userId, semester },
                    transaction
                });
                console.log('[RecordsService] 기존 수강내역 삭제 완료');
            }

            // 4. 시간표 데이터를 Records 형식으로 변환
            const convertedRecords = await this.mapTimetableToRecords(schedule.TimetableSlots, {
                userId,
                semester,
                scheduleId: schedule.id
            });

            // 5. Records로 저장
            const savedRecords = [];
            for (const recordData of convertedRecords) {
                const prevGrade = recordData.courseCode ? gradeMap[recordData.courseCode] : null;

                const record = await Records.create({
                    ...recordData,
                    grade: prevGrade || null,
                    sourceScheduleId: schedule.id,
                    conversionDate: new Date()
                }, { transaction });
                
                savedRecords.push(record);
            }

            await transaction.commit();
            return {
                totalCourses: savedRecords.length,
                totalCredits: savedRecords.reduce((sum, record) => sum + (record.credits || 0), 0),
                records: savedRecords,
                conversionDate: new Date()
            };

        } catch (error) {
            await transaction.rollback();
            console.error('[RecordsService] 변환 실패:', error);
            throw error;
        }
    },

    /**
     * 시간표 데이터를 Records 형식으로 매핑
     */
    async mapTimetableToRecords(timetableSlots, metadata) {
        const coursesMap = new Map();
        
        // 시간표 슬롯들을 과목별로 그룹핑
        for (const slot of timetableSlots) {
            const courseKey = slot.courseName + '_' + (slot.instructor || 'unknown');
            
            if (!coursesMap.has(courseKey)) {
                coursesMap.set(courseKey, {
                    userId: metadata.userId,
                    courseCode: slot.LectureCode?.code || null,
                    courseName: slot.courseName,
                    credits: slot.credits || 0,
                    grade: null,
                    semester: metadata.semester,
                    type: slot.type,
                    instructor: slot.instructor || '',
                    room: slot.room || '',
                    timeSlots: []
                });
            }
            
            // 시간 정보 추가
            const course = coursesMap.get(courseKey);
            course.timeSlots.push({
                dayOfWeek: slot.dayOfWeek,
                startPeriod: slot.startPeriod,
                endPeriod: slot.endPeriod,
                startTime: slot.startTime,
                endTime: slot.endTime,
                room: slot.room || ''
            });
        }

        // JSON 문자열로 시간 정보 저장
        return Array.from(coursesMap.values()).map(course => ({
            ...course,
            timeSlots: JSON.stringify(course.timeSlots)
        }));
    },

    /**
     * 내 수강 내역 전체 조회
     */
    async getRecords(userId) {
        const records = await Records.findAll({ 
            where: { userId },
            order: [['semester', 'DESC'], ['createdAt', 'DESC']]
        });

        // 시간 정보가 JSON 문자열인 경우 파싱
        return records.map(record => {
            const recordData = record.toJSON();
            if (recordData.timeSlots && typeof recordData.timeSlots === 'string') {
                try {
                    recordData.timeSlots = JSON.parse(recordData.timeSlots);
                } catch (e) {
                    recordData.timeSlots = [];
                }
            }
            return recordData;
        });
    },

    /**
     * 특정 학기 수강내역 조회
     */
    async getRecordsBySemester({ userId, semester }) {
        try {
            const records = await Records.findAll({
                where: { userId, semester },
                order: [['createdAt', 'DESC']]
            });

            // 시간 정보가 JSON 문자열인 경우 파싱
            const parsedRecords = records.map(record => {
                const recordData = record.toJSON();
                if (recordData.timeSlots && typeof recordData.timeSlots === 'string') {
                    try {
                        recordData.timeSlots = JSON.parse(recordData.timeSlots);
                    } catch (e) {
                        recordData.timeSlots = [];
                    }
                }
                return recordData;
            });

            const totalCredits = records.reduce((sum, record) => sum + (record.credits || 0), 0);

            return {
                semester,
                totalCourses: records.length,
                totalCredits,
                records: parsedRecords
            };

        } catch (error) {
            console.error('[RecordsService] 학기별 조회 실패:', error);
            throw error;
        }
    },

    /**
     * 변환 상태 확인
     */
    async getConversionStatus({ userId, semester }) {
        try {
            console.log("[getConversionStatus] userId=", userId, "semester=", semester);

            const schedule = await Schedule.findOne({
                where: { userId, semesterCode: semester },
                include: [
                    {
                        model: TimetableSlot,
                        as: 'TimetableSlots'
                    }
                ]
            });

            console.log("[getConversionStatus] schedule found:", schedule ? schedule.id : null);

            // 수강내역 존재 여부 확인
            const records = await Records.findAll({
                where: { userId, semester }
            });

            console.log("[getConversionStatus] records count:", records.length);

            const hasSchedule = schedule && schedule.TimetableSlots && schedule.TimetableSlots.length > 0;
            const hasRecords = records.length > 0;

            return {
                userId,
                semester,
                hasSchedule,
                hasRecords,
                scheduleLastModified: schedule?.updatedAt || null,
                recordsLastModified: records.length > 0 ? 
                    Math.max(...records.map(r => new Date(r.updatedAt).getTime())) : null,
                canConvert: hasSchedule,
                needsReconversion: hasSchedule && hasRecords && 
                    schedule.updatedAt > new Date(Math.max(...records.map(r => new Date(r.updatedAt).getTime())))
            };

        } catch (error) {
            console.error('[RecordsService] 상태 확인 실패:', error);
            throw error;
        }
    },

    /**
     * 특정 수강내역 수정 (성적 입력 등)
     */
    async updateRecord(recordId, data) {
        const record = await Records.findByPk(recordId);
        if (!record) throw new Error('수강 내역을 찾을 수 없습니다.');
        await record.update(data);
        return { message: '수강 내역이 수정되었습니다.', record };
    },

    /**
     * 특정 수강내역 삭제
     */
    async deleteRecord(recordId) {
        const record = await Records.findByPk(recordId);
        if (!record) throw new Error('수강 내역을 찾을 수 없습니다.');
        await record.destroy();
        return { message: '수강 내역이 삭제되었습니다.' };
    },

    /**
     * 특정 학기 수강내역 삭제
     */
    async deleteRecordsBySemester({ userId, semester }) {
        try {
            const deleted = await Records.destroy({
                where: { userId, semester }
            });

            if (deleted === 0) {
                throw new Error('삭제할 수강내역이 없습니다.');
            }

            console.log(`[RecordsService] 학기별 수강내역 삭제 완료: userId=${userId}, semester=${semester}, 삭제된 개수=${deleted}`);
            
            return { deleted };

        } catch (error) {
            console.error('[RecordsService] 학기별 수강내역 삭제 실패:', error);
            throw error;
        }
    },

    /**
     * 수강 내역 리뷰 등록
     */
    async addReview({ recordId, userId, content, rating }) {
        if (!recordId || !userId || !content || !rating) {
            throw new Error('recordId, userId, content, rating 모두 필요합니다.');
        }
        const review = await Review.create({ recordId, userId, content, rating });
        return { message: '리뷰가 등록되었습니다.', review };
    }
};