const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const NodeCache = require('node-cache');
const authMiddleware = require('../middlewares/authMiddleware');
require('dotenv').config();

// 기존 강의 API
const LecturesService = require('../service/lecturesService');
router.post('/add-to-curriculum', authMiddleware, async (req, res) => {
  try {
    const result = await LecturesService.addToCurriculum(req.body, req.user.userId);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get('/basic-knowledge', authMiddleware, async (req, res) => {
  try {
    const data = await LecturesService.getBasicKnowledge(req.query.lect_id);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get('/details', authMiddleware, async (req, res) => {
  try {
    const data = await LecturesService.getDetails(req.query.lect_id);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get('/pre-requisite', authMiddleware, async (req, res) => {
  try {
    const data = await LecturesService.getPrerequisites(req.query.lect_id);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get('/reviews', authMiddleware, async (req, res) => {
  try {
    const data = await LecturesService.getReviews(req.query.lect_id);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get('/roadmap', authMiddleware, async (req, res) => {
  try {
    const data = await LecturesService.getRoadmap(req.query.lect_id);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get('/search-by-name', authMiddleware, async (req, res) => {
  try {
    const data = await LecturesService.searchByName(req.query.name);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get('/search-by-professor', authMiddleware, async (req, res) => {
  try {
    const data = await LecturesService.searchByProfessor(req.query.professor);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get('/syllabus/search-by-filename', authMiddleware, async (req, res) => {
  try {
    const query = req.query.query;
    const data = await LecturesService.searchSyllabusFileByName(query);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== S3 강의계획서 API ======================
const cache = new NodeCache({ stdTTL: 300 });

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

function parseS3Key(key) {
  const pathParts = key.split('/');
  const semester = pathParts[pathParts.length - 2];
  const fileName = pathParts[pathParts.length - 1].replace('.pdf', '');
  const [code, section, professor, name] = fileName.split('-');
  return { code, section, professor, name, semester, key };
}

async function fetchAllSyllabus() {
  if (cache.has('syllabus')) return cache.get('syllabus');
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: process.env.AWS_FOLDER_PREFIX,
  };
  const data = await s3.listObjectsV2(params).promise();
  const files = data.Contents.filter(obj => obj.Size > 0).map(obj => {
    const parsed = parseS3Key(obj.Key);
    return {
      ...parsed,
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`,
    };
  });
  cache.set('syllabus', files);
  return files;
}

// 전체 리스트
router.get('/syllabus/list', authMiddleware, async (req, res) => {
  try {
    const list = await fetchAllSyllabus();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 통합 검색
router.get('/syllabus/search', authMiddleware, async (req, res) => {
  try {
    const query = req.query.query || '';
    const list = await fetchAllSyllabus();
    const result = list.filter(i =>
      (i.name && i.name.includes(query)) ||
      (i.professor && i.professor.includes(query)) ||
      (i.code && i.code.includes(query))
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 과목명 기준 검색
router.get('/syllabus/search-by-subject', authMiddleware, async (req, res) => {
  try {
    const query = req.query.name || '';
    const list = await fetchAllSyllabus();
    const result = list.filter(i => i.name && i.name.includes(query));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 교수명 기준 검색
router.get('/syllabus/search-by-professor', authMiddleware, async (req, res) => {
  try {
    const query = req.query.name || '';
    const list = await fetchAllSyllabus();
    const result = list.filter(i => i.professor && i.professor.includes(query));
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 과목별 그룹핑
router.get('/syllabus/grouped-by-subject', authMiddleware, async (req, res) => {
  try {
    const list = await fetchAllSyllabus();
    const grouped = {};
    list.forEach(i => {
      if (!grouped[i.name]) grouped[i.name] = [];
      grouped[i.name].push(i);
    });
    res.status(200).json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 학기별 그룹핑
router.get('/syllabus/grouped-by-semester', authMiddleware, async (req, res) => {
  try {
    const list = await fetchAllSyllabus();
    const grouped = {};
    list.forEach(i => {
      if (!grouped[i.semester]) grouped[i.semester] = [];
      grouped[i.semester].push(i);
    });
    res.status(200).json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// PDF 미리보기용 Signed URL 발급
router.get('/syllabus/view', authMiddleware, async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ error: 'key is required' });
    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: 300 // 5분
    });
    res.status(200).json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 과목명 목록만 추출
router.get('/syllabus/subjects', authMiddleware, async (req, res) => {
  try {
    const list = await fetchAllSyllabus();
    const subjects = [...new Set(list.map(i => i.name))];
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 교수명 목록만 추출
router.get('/syllabus/professors', authMiddleware, async (req, res) => {
  try {
    const list = await fetchAllSyllabus();
    const professors = [...new Set(list.map(i => i.professor))];
    res.status(200).json(professors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
