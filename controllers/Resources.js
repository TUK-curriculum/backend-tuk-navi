const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { Resource } = require('../models');
const { uploadToS3 } = require('../utils/s3Uploader');
const authMiddleware = require('../middlewares/authMiddleware');

// 자료실 목록
router.get('/:courseId', authMiddleware, async (req, res) => {
  try {
    const resources = await Resource.findAll({
      where: { courseId: req.params.courseId },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 자료실 업로드 (독립 업로드 가능)
router.post('/:courseId', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, description } = req.body;

    let fileUrl = null;
    if (req.file) {
      fileUrl = await uploadToS3(req.file);
    }

    const resource = await Resource.create({
      courseId: req.params.courseId,
      uploaderId: req.user.userId,
      title,
      description,
      fileUrl
    });

    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;