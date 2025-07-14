// api/lectures.js
const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const NodeCache = require('node-cache');
const authMiddleware = require('../middlewares/authMiddleware');
require('dotenv').config();

const cache = new NodeCache({ stdTTL: 300 });

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

function parseS3Key(key) {
  const pathParts = key.split('/');
  // 경로 예시: syllabus/CE/2024-2/AAK10073-01-박경원-대학수학.pdf
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

// 1. 전체 리스트 조회
router.get('/syllabus/list', authMiddleware, async (req, res) => {
  try {
    const list = await fetchAllSyllabus();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. 통합 검색 (과목명, 교수명, 코드)
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

// 3. 과목명 기준 검색
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

// 4. 교수명 기준 검색
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

// 5. 과목별 그룹핑
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

// 6. 학기별 그룹핑
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

// 7. PDF 미리보기용 Signed URL 발급
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

// 8. 과목명 목록만 추출
router.get('/syllabus/subjects', authMiddleware, async (req, res) => {
  try {
    const list = await fetchAllSyllabus();
    const subjects = [...new Set(list.map(i => i.name))];
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. 교수명 목록만 추출
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
