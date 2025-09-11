// controllers/Curriculums.js
const express = require('express');
const router = express.Router();
const CurriculumsService = require('../service/CurriculumsService');
const { LectureCode } = require('../models');

/**
 * [GET] /curriculums
 * 내 커리큘럼 전체 조회
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const defaultOnly = req.query.defaultOnly === 'true';
        const curriculums = await CurriculumsService.getCurriculums(userId, { defaultOnly });
        
        res.status(200).json({
            success: true,
            curriculums
        });
    } catch (error) {
        console.error('Get curriculums error:', error);
        res.status(500).json({
            success: false,
            message: error.message || '커리큘럼 목록 조회에 실패했습니다.'
        });
    }
});

/**
 * [GET] /curriculums/:id
 * 특정 커리큘럼 상세 조회
 */
router.get('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const curriculumId = parseInt(req.params.id, 10);
        
        if (isNaN(curriculumId)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 커리큘럼 ID입니다.'
            });
        }

        const curriculum = await CurriculumsService.getCurriculumById(userId, curriculumId);
        
        res.status(200).json({
            success: true,
            curriculum
        });
    } catch (error) {
        console.error('Get curriculum error:', error);
        if (error.message.includes('찾을 수 없습니다')) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: error.message || '커리큘럼 조회에 실패했습니다.'
            });
        }
    }
});

/**
 * [POST] /curriculums
 * 새 커리큘럼 생성
 */
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, description, conditions, isDefault = false } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: '커리큘럼 이름은 필수입니다.'
            });
        }

        if (name.length > 50) {
            return res.status(400).json({
                success: false,
                message: '커리큘럼 이름은 50자를 초과할 수 없습니다.'
            });
        }

        const curriculum = await CurriculumsService.createCurriculum(userId, {
            name: name.trim(),
            description: description || null,
            conditions: conditions || '',
            isDefault: Boolean(isDefault)
        });

        res.status(201).json({
            success: true,
            curriculum
        });
    } catch (error) {
        console.error('Create curriculum error:', error);
        res.status(500).json({
            success: false,
            message: error.message || '커리큘럼 생성에 실패했습니다.'
        });
    }
});

/**
 * [PUT] /curriculums/:id
 * 커리큘럼 수정
 */
router.put('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const curriculumId = parseInt(req.params.id, 10);
        const { name, description, conditions, isDefault } = req.body;

        if (isNaN(curriculumId)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 커리큘럼 ID입니다.'
            });
        }

        const updateData = {};
        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '커리큘럼 이름은 필수입니다.'
                });
            }
            if (name.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: '커리큘럼 이름은 50자를 초과할 수 없습니다.'
                });
            }
            updateData.name = name.trim();
        }
        if (description !== undefined) {
            updateData.description = description;
        }
        if (conditions !== undefined) {
            updateData.conditions = conditions;
        }
        if (isDefault !== undefined) {
            updateData.isDefault = Boolean(isDefault);
        }

        const curriculum = await CurriculumsService.updateCurriculum(userId, curriculumId, updateData);

        res.status(200).json({
            success: true,
            curriculum
        });
    } catch (error) {
        console.error('Update curriculum error:', error);
        if (error.message.includes('찾을 수 없습니다')) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: error.message || '커리큘럼 수정에 실패했습니다.'
            });
        }
    }
});

/**
 * [DELETE] /curriculums/:id
 * 커리큘럼 삭제
 */
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const curriculumId = parseInt(req.params.id, 10);

        if (isNaN(curriculumId)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 커리큘럼 ID입니다.'
            });
        }

        await CurriculumsService.deleteCurriculum(userId, curriculumId);

        res.status(200).json({
            success: true,
            message: '커리큘럼이 삭제되었습니다.'
        });
    } catch (error) {
        console.error('Delete curriculum error:', error);
        if (error.message.includes('찾을 수 없습니다')) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: error.message || '커리큘럼 삭제에 실패했습니다.'
            });
        }
    }
});

/**
 * [GET] /curriculums/default
 * 기본 커리큘럼 조회
 */
router.get('/default', async (req, res) => {
    try {
        const userId = req.user.userId;
        const curriculum = await CurriculumsService.getDefaultCurriculum(userId);
        
        res.status(200).json({
            success: true,
            curriculum
        });
    } catch (error) {
        console.error('Get default curriculum error:', error);
        res.status(500).json({
            success: false,
            message: error.message || '기본 커리큘럼 조회에 실패했습니다.'
        });
    }
});

/**
 * [POST] /curriculums/default
 * 기본 커리큘럼 설정
 */
router.post('/default', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { curriculumId } = req.body;

        if (!curriculumId) {
            return res.status(400).json({
                success: false,
                message: '커리큘럼 ID가 필요합니다.'
            });
        }

        const result = await CurriculumsService.setDefaultCurriculum(userId, parseInt(curriculumId, 10));
        
        res.status(200).json({
            success: true,
            message: '기본 커리큘럼이 설정되었습니다.',
            ...result
        });
    } catch (error) {
        console.error('Set default curriculum error:', error);
        res.status(500).json({
            success: false,
            message: error.message || '기본 커리큘럼 설정에 실패했습니다.'
        });
    }
});

/**
 * [POST] /curriculums/:id/lectures
 * 커리큘럼에 강의 추가
 */
router.post('/:id/lectures', async (req, res) => {
    try {
        const userId = req.user.userId;
        const curriculumId = parseInt(req.params.id, 10);
        let { lect_id, courseCode, name, credits, semester, type, grade, status } = req.body;

        if (isNaN(curriculumId)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 커리큘럼 ID입니다.'
            });
        }

        

        if (!lect_id && courseCode) {
            const lectureCode = await LectureCode.findOne({
                where: { code: courseCode }
            });
            if (lectureCode) {
                lect_id = lectureCode.id;
                if (!name) name = lectureCode.name;
                if (!credits) credits = lectureCode.credits;
                if (!type) type = lectureCode.type;
                if (!grade) grade = lectureCode.grade;
            }
        }

        // 필수 필드 검증
        if ((!lect_id && !name) || !credits || !semester || !type || grade === undefined) {
            return res.status(400).json({
                success: false,
                message: '모든 필수 필드를 입력해주세요. (lect_id, name, credits, semester, type, grade)'
            });
        }

        if (credits < 1 || credits > 3) {
            return res.status(400).json({
                success: false,
                message: '학점은 1~3 사이여야 합니다.'
            });
        }

        // 타입 검증
        const validTypes = ['GR', 'GE', 'MR', 'ME', 'RE', 'FE'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: `타입은 다음 중 하나여야 합니다: ${validTypes.join(', ')}`
            });
        }

        const validSemesters = ['1', '2', 'S', 'W'];
        if (!validSemesters.includes(semester)) {
            return res.status(400).json({
                success: false,
                message: `학기는 다음 중 하나여야 합니다: ${validSemesters.join(', ')}`
            });
        }

        const lecture = await CurriculumsService.addLecture(userId, curriculumId, {
            lect_id: parseInt(lect_id, 10),
            courseCode,
            name: name.trim(),
            credits: parseInt(credits, 10),
            semester,
            type,
            grade: parseInt(grade, 10),
            status
        });

        res.status(201).json({
            success: true,
            lecture
        });
    } catch (error) {
        console.error('Add lecture error:', error);
        if (error.message.includes('찾을 수 없습니다') || error.message.includes('이미 존재합니다')) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: error.message || '강의 추가에 실패했습니다.'
            });
        }
    }
});

/**
 * [PUT] /curriculums/:id/lectures/:lectureId
 * 강의 수정
 */
router.put('/:id/lectures/:lectureId', async (req, res) => {
    try {
        const userId = req.user.userId;
        const curriculumId = parseInt(req.params.id, 10);
        const lectureId = parseInt(req.params.lectureId, 10);
        const updateData = req.body;

        if (isNaN(curriculumId) || isNaN(lectureId)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }

        // 타입 검증
        if (updateData.type) {
            const validTypes = ['GR', 'GE', 'MR', 'ME', 'RE', 'FE'];
            if (!validTypes.includes(updateData.type)) {
                return res.status(400).json({
                    success: false,
                    message: `타입은 다음 중 하나여야 합니다: ${validTypes.join(', ')}`
                });
            }
        }

        if (updateData.semester) {
            const validSemesters = ['1', '2', 'S', 'W'];
            if (!validSemesters.includes(updateData.semester)) {
                return res.status(400).json({
                    success: false,
                    message: `학기는 다음 중 하나여야 합니다: ${validSemesters.join(', ')}`
                });
            }
        }

        const lecture = await CurriculumsService.updateLecture(userId, curriculumId, lectureId, updateData);

        res.status(200).json({
            success: true,
            lecture
        });
    } catch (error) {
        console.error('Update lecture error:', error);
        if (error.message.includes('찾을 수 없습니다')) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: error.message || '강의 수정에 실패했습니다.'
            });
        }
    }
});

/**
 * [DELETE] /curriculums/:id/lectures/:lectureId
 * 강의 삭제
 */
router.delete('/:id/lectures/:lectureId', async (req, res) => {
    try {
        const userId = req.user.userId;
        const curriculumId = parseInt(req.params.id, 10);
        const lectureId = parseInt(req.params.lectureId, 10);

        if (isNaN(curriculumId) || isNaN(lectureId)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 ID입니다.'
            });
        }

        await CurriculumsService.deleteLecture(userId, curriculumId, lectureId);

        res.status(200).json({
            success: true,
            message: '강의가 삭제되었습니다.'
        });
    } catch (error) {
        console.error('Delete lecture error:', error);
        if (error.message.includes('찾을 수 없습니다')) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                message: error.message || '강의 삭제에 실패했습니다.'
            });
        }
    }
});

module.exports = router;