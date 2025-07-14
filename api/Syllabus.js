const express = require('express');
const router = express.Router();
const syllabusController = require('../controllers/Syllabus');

router.get('/syllabus/files', syllabusController.getSyllabusFiles);
router.get('/syllabus/search', syllabusController.searchSyllabusFiles);

module.exports = router;
