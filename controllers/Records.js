const express = require('express');
const router = express.Router();
const recordsService = require('../service/RecordsService');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * [POST] /records/convert/:semester
 * 시간표를 수강내역으로 변환
 */
router.post('/convert/:semester', authMiddleware, async (req, res) => {
    try {
        const { semester } = req.params;
        const { overwrite = false } = req.body;
        const userId = req.user.userId;

        console.log(`[Records] 변환 요청: userId=${userId}, semester=${semester}`);

        const result = await recordsService.convertTimetableToRecords({
            userId,
            semester,
            overwrite
        });

        res.status(200).json({
            success: true,
            message: '시간표가 수강내역으로 성공적으로 변환되었습니다.',
            data: result
        });

    } catch (error) {
        console.error('[Records] 변환 실패:', error);
        res.status(500).json({
            success: false,
            message: error.message || '시간표 변환 중 오류가 발생했습니다.'
        });
    }
});

/**
 * [GET] /records
 * 내 수강내역 전체 조회
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const records = await recordsService.getRecords(req.user.userId);

        res.status(200).json({
            success: true,
            message: '수강 내역 조회 성공',
            data: records
        });
    } catch (error) {
        console.error('[GET /records] 수강내역 조회 에러:', error.message);
        res.status(500).json({
            success: false,
            message: '서버 오류로 수강 내역을 조회할 수 없습니다.',
            error: error.message
        });
    }
});

/**
 * [GET] /records/semester/:semester
 * 특정 학기 수강내역 조회
 */
router.get('/semester/:semester', authMiddleware, async (req, res) => {
    try {
        const { semester } = req.params;
        const userId = req.user.userId;

        const records = await recordsService.getRecordsBySemester({
            userId,
            semester
        });

        res.status(200).json({
            success: true,
            data: records
        });

    } catch (error) {
        console.error('[Records] 학기별 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '수강내역 조회 중 오류가 발생했습니다.'
        });
    }
});

/**
 * [GET] /records/conversion-status/:semester
 * 변환 상태 확인
 */
router.get('/conversion-status/:semester', authMiddleware, async (req, res) => {
    try {
        const { semester } = req.params;
        const userId = req.user.userId;

        const status = await recordsService.getConversionStatus({
            userId,
            semester
        });

        res.status(200).json({
            success: true,
            data: status
        });

    } catch (error) {
        console.error('[Records] 상태 확인 실패:', error);
        res.status(500).json({
            success: false,
            message: '변환 상태 확인 중 오류가 발생했습니다.'
        });
    }
});

/**
 * [PUT] /records/:recordId
 * 특정 수강내역 수정 (성적 입력 등)
 */
router.put('/:recordId', authMiddleware, async (req, res) => {
    try {
        const { recordId } = req.params;
        if (!recordId) {
            return res.status(400).json({
                success: false,
                message: 'recordId가 필요합니다.'
            });
        }

        const updated = await recordsService.updateRecord(recordId, req.body);

        res.status(200).json({
            success: true,
            message: updated.message,
            data: updated.record
        });
    } catch (error) {
        console.error('[PUT /records/:recordId] 수강내역 수정 에러:', error.message);
        res.status(500).json({
            success: false,
            message: '서버 오류로 수강 내역을 수정할 수 없습니다.',
            error: error.message
        });
    }
});

/**
 * [DELETE] /records/semester/:semester
 * 특정 학기 수강내역 삭제
 */
router.delete('/semester/:semester', authMiddleware, async (req, res) => {
    try {
        const { semester } = req.params;
        const userId = req.user.userId;

        await recordsService.deleteRecordsBySemester({
            userId,
            semester
        });

        res.status(200).json({
            success: true,
            message: '해당 학기 수강내역이 성공적으로 삭제되었습니다.'
        });

    } catch (error) {
        console.error('[Records] 학기별 삭제 실패:', error);
        res.status(500).json({
            success: false,
            message: '수강내역 삭제 중 오류가 발생했습니다.'
        });
    }
});

/**
 * [DELETE] /records/:recordId
 * 특정 수강내역 삭제
 */
router.delete('/:recordId', authMiddleware, async (req, res) => {
    try {
        const { recordId } = req.params;
        if (!recordId) {
            return res.status(400).json({
                success: false,
                message: 'recordId가 필요합니다.'
            });
        }

        const result = await recordsService.deleteRecord(recordId);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('[DELETE /records/:recordId] 수강내역 삭제 에러:', error.message);
        res.status(500).json({
            success: false,
            message: '서버 오류로 수강 내역을 삭제할 수 없습니다.',
            error: error.message
        });
    }
});

/**
 * [POST] /records/reviews
 * 수강 내역 리뷰 등록
 */
router.post('/reviews', authMiddleware, async (req, res) => {
    try {
        const { recordId, content, rating } = req.body;

        if (!recordId || !content || rating == null) {
            return res.status(400).json({
                success: false,
                message: 'recordId, content, rating 모두 입력해야 합니다.'
            });
        }

        const newReview = await recordsService.addReview({
            recordId,
            content,
            rating,
            userId: req.user.userId
        });

        res.status(201).json({
            success: true,
            message: '리뷰가 성공적으로 등록되었습니다.',
            data: newReview
        });
    } catch (error) {
        console.error('[POST /records/reviews] 리뷰 등록 에러:', error.message);
        res.status(500).json({
            success: false,
            message: '서버 오류로 리뷰를 등록할 수 없습니다.',
            error: error.message
        });
    }
});

module.exports = router;