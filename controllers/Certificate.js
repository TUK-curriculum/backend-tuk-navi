// controllers/Certificate.js
'use strict';

const express = require('express');
const router = express.Router();
const certificateService = require('../service/CertificateService');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * ✅ [POST] /certificate
 * 어학 자격증 등록
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { language, score, certifiedDate } = req.body;

    // 필수 입력값 체크
    if (!language || !score || !certifiedDate) {
      return res.status(400).json({ success: false, message: 'language, score, certifiedDate는 필수입니다.' });
    }

    const result = await certificateService.addCertificate(req.user.userId, req.body);
    res.status(201).json({ success: true, message: result.message, certificate: result.certificate });
  } catch (error) {
    console.error('🚨 Certificate 등록 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * ✅ [PUT] /certificate/:certId
 * 어학 자격증 수정
 */
router.put('/:certId', authMiddleware, async (req, res) => {
  try {
    const { certId } = req.params;
    if (!certId) {
      return res.status(400).json({ success: false, message: 'certId가 필요합니다.' });
    }

    const updated = await certificateService.updateCertificate(req.user.userId, certId, req.body);
    res.status(200).json({ success: true, message: updated.message, certificate: updated.certificate });
  } catch (error) {
    console.error('🚨 Certificate 수정 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * ✅ [DELETE] /certificate/:certId
 * 어학 자격증 삭제
 */
router.delete('/:certId', authMiddleware, async (req, res) => {
  try {
    const { certId } = req.params;
    if (!certId) {
      return res.status(400).json({ success: false, message: 'certId가 필요합니다.' });
    }

    const deleted = await certificateService.deleteCertificate(req.user.userId, certId);
    res.status(200).json({ success: true, message: deleted.message });
  } catch (error) {
    console.error('🚨 Certificate 삭제 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * ✅ [GET] /certificate
 * 내 어학 자격증 전체 조회
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const certificates = await certificateService.getCertificates(req.user.userId);
    res.status(200).json({ success: true, certificates });
  } catch (error) {
    console.error('🚨 Certificate 조회 에러:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
