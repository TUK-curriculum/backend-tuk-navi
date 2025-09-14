const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 10
  }
});

const { Review, ReviewFile, Resource, Course, Records } = require('../models');
const { uploadToS3 } = require('../utils/s3Uploader');
const authMiddleware = require('../middlewares/authMiddleware');

// 리뷰 목록
router.get('/:code', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findOne({ where: { code: req.params.code } });
    if (!course) return res.status(404).json({ success: false, message: '강의 없음' });

    const records = await Records.findAll({ 
      where: { courseCode: req.params.code } 
    });
    
    if (records.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const recordIds = records.map(record => record.id);

    const reviews = await Review.findAll({
      where: { recordId: recordIds },
      include: [
        { model: ReviewFile, as: 'files' },
        { 
          model: Records, 
          as: 'record',
          attributes: ['courseName', 'instructor', 'semester', 'grade']
        }
      ]
    });

    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('[리뷰 조회 오류]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 리뷰 작성
router.post('/:code', authMiddleware, upload.array('files'), async (req, res) => {
  try {
    console.log('=== 리뷰 작성 요청 ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files?.length || 0);
    
    const { rating, content } = req.body;

    // 입력 검증
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: '리뷰 내용을 입력해주세요.' });
    }

    if (!rating || rating === "0") {
      return res.status(400).json({ success: false, message: '평점을 선택해주세요.' });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: '평점은 1-5 사이의 숫자여야 합니다.' });
    }

    const course = await Course.findOne({ where: { code: req.params.code } });
    if (!course) {
      return res.status(404).json({ success: false, message: '해당 강의를 찾을 수 없습니다.' });
    }

    console.log('Found course:', course.name);

    let record = await Records.findOne({ 
      where: { 
        courseCode: req.params.code,
        userId: req.user.userId 
      } 
    });

    if (!record) {
      console.log('Creating new record for user:', req.user.userId);
      record = await Records.create({
        userId: req.user.userId,
        courseCode: req.params.code,
        courseName: lecture.name,
        credits: lecture.credits || 3,
        grade: null,
        semester: lecture.semester || '2025-1',
        type: lecture.type || 'ME',
        instructor: null,
        room: null,
        timeSlots: null,
        sourceScheduleId: null,
        conversionDate: null
      });
      console.log('Record created:', record.id);
    } else {
      console.log('Found existing record:', record.id);
    }

    const review = await Review.create({
      userId: req.user.userId,
      recordId: record.id,
      rating: ratingNum,
      content: content.trim(),
    });

    console.log('Review created:', review.id);

    // 파일 처리
    if (req.files && req.files.length > 0) {
      console.log('Processing files:', req.files.length);
      
      for (const file of req.files) {
        try {
          console.log('Uploading file:', file.originalname);
          const s3Url = await uploadToS3(file);
          console.log('S3 URL:', s3Url);

          await ReviewFile.create({
            reviewId: review.id,
            fileName: file.originalname,
            fileUrl: s3Url,
          });

          await Resource.create({
            courseId: course.id,
            uploaderId: req.user.userId,
            title: file.originalname,
            fileUrl: s3Url,
            description: '리뷰 첨부 파일',
          });

          console.log('File processed successfully');
        } catch (fileError) {
          console.error('File processing error:', fileError);
        }
      }
    }

    // 생성된 리뷰 조회
    const newReview = await Review.findByPk(review.id, {
      include: [
        { model: ReviewFile, as: 'files' },
        { model: Records, as: 'record' }
      ]
    });

    console.log('Review creation completed successfully');
    
    res.status(201).json({ 
      success: true, 
      data: newReview,
      message: '리뷰가 성공적으로 등록되었습니다.'
    });

  } catch (err) {
    console.error('=== 리뷰 작성 오류 ===');
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    
    // Sequelize 에러 처리
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: '입력 데이터가 올바르지 않습니다.',
        details: err.errors?.map(e => e.message)
      });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: '연관된 데이터를 찾을 수 없습니다.'
      });
    }

    res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 리뷰 수정
router.put('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content, rating } = req.body;

    const review = await Review.findByPk(reviewId);
    if (!review) return res.status(404).json({ success: false, message: '리뷰 없음' });

    // 작성자 확인
    if (review.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: '권한 없음' });
    }

    await review.update({ content, rating });
    res.json({ success: true, data: review });
  } catch (err) {
    console.error('[리뷰 수정 오류]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 리뷰 삭제
router.delete('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByPk(reviewId);
    if (!review) return res.status(404).json({ success: false, message: '리뷰 없음' });

    // 작성자 확인
    if (review.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: '권한 없음' });
    }

    await review.destroy();
    res.json({ success: true, message: '삭제 완료' });
  } catch (err) {
    console.error('[리뷰 삭제 오류]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;