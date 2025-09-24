const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const TimetableService = require('../service/TimetableService');
const xlsx = require('xlsx');

// GET /timetable/current
router.get('/current', authMiddleware, async (req, res) => {
    try {
        const { semester } = req.query; 
        const data = await TimetableService.getCurrent(req.user.userId, semester);
        
        console.log('[DEBUG] /timetable/current response:', JSON.stringify(data, null, 2));
        res.json({ success: true, data: data || null });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// GET /timetable/semester/:semester - 특정 학기 시간표 조회
router.get('/semester/:semester', authMiddleware, async (req, res) => {
    console.log('[DEBUG] /semester/:semester hit!', req.params);
    try {
        const { semester } = req.params;
        const data = await TimetableService.getBySemester(req.user.userId, semester, { includeSlots: true });
        
        if (!data) {
            return res.status(404).json({ success: false, message: 'Timetable not found for this semester' });
        }
        
        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE /timetable/semester/:semester - 특정 학기 시간표 삭제
router.delete('/semester/:semester', authMiddleware, async (req, res) => {
    try {
        const { semester } = req.params;
        const success = await TimetableService.delete(req.user.userId, semester, 'semester');
        
        if (!success) {
            return res.status(404).json({ 
                success: false, 
                message: 'Timetable not found for this semester' 
            });
        }
        
        res.json({ success: true, message: 'Timetable deleted successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE /timetable/course/:semester/:slotId
router.delete('/course/:semester/:slotId', authMiddleware, async (req, res) => {
    try {
        const { semester, slotId } = req.params;
        const result = await TimetableService.deleteCourse(
            req.user.userId,
            semester,
            Number(slotId)
        );
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});


// POST /timetable - 새 시간표 생성 
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { semesterCode, courses, year, isGenerated } = req.body;

        if (!semesterCode || !Array.isArray(courses)) {
            return res.status(400).json({
                success: false,
                message: 'Semester and courses array are required'
            });
        }

        const timetable = { lectures: courses, semesterCode: semesterCode };
        const saved = await TimetableService.saveTimetable(
            req.user.userId,
            timetable,
            semesterCode,
            { isGenerated }
        );

        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        console.error('[POST /timetable] saveTimetable error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /timetable/:id - 기존 시간표 업데이트
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        let { semester, semesterCode, courses, year, isGenerated } = req.body;

        semester = semester || semesterCode;

        if (!semester || !Array.isArray(courses)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Semester and courses array are required' 
            });
        }

        const timetable = { lectures: courses, semesterCode: semester };
        const updated = await TimetableService.saveTimetable(
            req.user.userId,
            timetable,
            semester,
            { isGenerated }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Timetable not found' });
        }
        
        res.json({ success: true, data: updated });
    } catch (err) {
        console.error('[PUT /timetable/:id] saveTimetable error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /timetable/:id - 시간표 삭제
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await TimetableService.delete(req.user.userId, id);
        
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Timetable not found' });
        }
        
        res.json({ success: true, data: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// GET /timetable/all - 모든 시간표 조회
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const data = await TimetableService.getAll(req.user.userId, { includeSlots: true });
        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});


// GET /timetable/history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const list = await TimetableService.getHistory(req.user.userId);
        res.json({ success: true, data: list });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// GET /timetable/semesters  
router.get('/semesters', authMiddleware, async (req, res) => {
    try {
        const { UserProfile } = require('../models');
        const profile = await UserProfile.findOne({
            where: { userId: req.user.userId },
            attributes: ['enrollment_year', 'graduation_year'],
            raw: true,
        });

        if (!profile || !profile.enrollment_year) {
            return res.status(400).json({ success: false, message: '입학년도(enrollment_year)가 필요합니다.' });
        }

        const now = new Date();
        const currentYear = now.getFullYear();
        const month = now.getMonth() + 1;

        const currentSem = (month >= 1 && month <= 6) ? 1 : 2;

        const startYear = Number(profile.enrollment_year);
        const endYear = Math.min(Number(profile.graduation_year || currentYear), currentYear);

        if (startYear > endYear) {
            return res.json({ success: true, data: [] });
        }

        const semesters = [];
        for (let y = startYear; y <= endYear; y++) {
            const maxSem = (y === currentYear) ? currentSem : 2;
            for (let s = 1; s <= maxSem; s++) {
                semesters.push(`${y}-${s}학기`);
            }
        }

        res.json({
            success: true,
            data: semesters,
            meta: { startYear, endYear, currentSem }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /timetable/upload-excel - 엑셀 업로드
router.post('/upload-excel', authMiddleware, async (req, res) => {
    try {
        console.log('[DEBUG] req.files:', req.files);
        console.log('[DEBUG] req.body:', req.body);

        if (!req.files || !req.files.file) {
            return res.status(400).json({ success: false, message: '엑셀 파일이 필요합니다.' });
        }

        const { semester } = req.body;
        const file = req.files.file;

        // 엑셀 파싱
        const workbook = xlsx.read(file.data, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet);

        console.log('[UploadExcel] rows:', rows.slice(0, 3));

        const existingSchedule = await TimetableService.getBySemester(req.user.userId, semester);
        
        let result;
        if (existingSchedule) {
            // 기존 시간표가 있으면 업데이트
            console.log('[UploadExcel] Updating existing schedule:', existingSchedule.id);
            result = await TimetableService.update(req.user.userId, existingSchedule.id, {
                semesterCode: semester,
                year: new Date().getFullYear(),
                courses: rows
            });
        } else {
            // 기존 시간표가 없으면 새로 생성
            console.log('[UploadExcel] Creating new schedule');
            result = await TimetableService.create(req.user.userId, {
                semesterCode: semester,
                year: new Date().getFullYear(),
                courses: rows
            });
        }

        let plainResult;
        try {
            plainResult = result.toJSON ? result.toJSON() : result;
        } catch (err) {
            console.error('[UploadExcel] toJSON 변환 실패:', err);
            plainResult = result;
        }

        console.log('[UploadExcel] final result:', JSON.stringify(plainResult, null, 2));
        res.json({ success: true, data: plainResult });
    } catch (err) {
        console.error('[UploadExcel Error]', err);
        res.status(500).json({ success: false, message: '엑셀 업로드 실패: ' + err.message });
    }
});


// POST /timetable/generate - 커리큘럼 기반 시간표 자동 생성
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const {
      curriculumId,
      preferences = {},
      excludeGenerated = []
    } = req.body;

    if (!curriculumId) {
      return res.status(400).json({
        success: false,
        message: 'curriculumId가 필요합니다.'
      });
    }

    const { timetables, is_avoid_failed, avoid_failed_reasons } = await TimetableService.generateTimetables(
      req.user.userId,
      curriculumId,
      preferences,
      excludeGenerated
    );

    res.status(200).json({
      success: true,
      message: `${timetables.length}개의 시간표가 생성되었습니다.`,
      data: {
        timetables,
        total: timetables.length,
        hasMore: timetables.length === 5,
        is_avoid_failed,
        avoid_failed_reasons
      }
    });
  } catch (error) {
    console.error('[POST /timetable/generate] 시간표 생성 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 시간표를 생성할 수 없습니다.',
      error: error.message
    });
  }
});

// POST /timetable/refresh - 새로운 시간표 조합 생성
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const {
      curriculumId,
      preferences = {},
      excludeGenerated = []
    } = req.body;

    if (!curriculumId) {
      return res.status(400).json({
        success: false,
        message: 'curriculumId가 필요합니다.'
      });
    }

    const { timetables, is_avoid_failed, avoid_failed_reasons } = await TimetableService.refreshTimetables(
      req.user.userId,
      curriculumId,
      preferences,
      excludeGenerated
    );

    res.status(200).json({
      success: true,
      message: `새로운 ${timetables.length}개의 시간표가 생성되었습니다.`,
      data: {
        timetables,
        total: timetables.length,
        hasMore: timetables.length === 5,
        is_avoid_failed,
        avoid_failed_reasons
      }
    });
  } catch (error) {
    console.error('[POST /timetable/refresh] 시간표 새로고침 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 시간표를 새로고침할 수 없습니다.',
      error: error.message
    });
  }
});

// GET /timetable/preferences - 시간표 생성 조건 옵션 조회
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const preferences = await TimetableService.getPreferenceOptions();

    res.status(200).json({
      success: true,
      message: '시간표 생성 조건 옵션 조회 성공',
      data: preferences
    });
  } catch (error) {
    console.error('[GET /timetable/preferences] 조건 옵션 조회 에러:', error.message);
    res.status(500).json({
      success: false,
      message: '서버 오류로 조건 옵션을 조회할 수 없습니다.',
      error: error.message
    });
  }
});

module.exports = router;
