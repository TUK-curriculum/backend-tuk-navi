// service/CertificateService.js
'use strict';

const { Certificate } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  /**
   * 어학 자격증 추가
   * @param {number} userId - 사용자 ID
   * @param {Object} data - { language, score, certifiedDate }
   * @returns {Promise<Object>} 등록 결과
   */
  async addCertificate(userId, data) {
    try {
      // 필수 필드 검증
      if (!data.language || !data.score || !data.certifiedDate) {
        throw new Error('language, score, certifiedDate 모두 입력해야 합니다.');
      }

      // 중복 등록 방지 (같은 userId + language + score가 이미 존재하는지 확인)
      const exists = await Certificate.findOne({
        where: {
          userId,
          language: data.language,
          score: data.score
        }
      });
      if (exists) {
        throw new Error('이미 동일한 어학 자격증이 등록되어 있습니다.');
      }

      const newCert = await Certificate.create({ ...data, userId });
      return { message: '어학 자격증이 등록되었습니다.', certificate: newCert };
    } catch (error) {
      console.error('🚨 어학 자격증 등록 에러:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * 어학 자격증 수정
   * @param {number} userId - 사용자 ID
   * @param {number} certId - 수정할 자격증 ID
   * @param {Object} data - 수정할 내용
   * @returns {Promise<Object>} 수정 결과
   */
  async updateCertificate(userId, certId, data) {
    try {
      const cert = await Certificate.findOne({ where: { id: certId, userId } });
      if (!cert) {
        throw new Error('수정할 자격증을 찾을 수 없습니다.');
      }

      await cert.update(data);
      return { message: '어학 자격증이 수정되었습니다.', certificate: cert };
    } catch (error) {
      console.error('🚨 어학 자격증 수정 에러:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * 어학 자격증 삭제
   * @param {number} userId - 사용자 ID
   * @param {number} certId - 삭제할 자격증 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteCertificate(userId, certId) {
    try {
      const cert = await Certificate.findOne({ where: { id: certId, userId } });
      if (!cert) {
        throw new Error('삭제할 자격증을 찾을 수 없습니다.');
      }

      await cert.destroy();
      return { message: '어학 자격증이 삭제되었습니다.' };
    } catch (error) {
      console.error('🚨 어학 자격증 삭제 에러:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * 어학 자격증 전체 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Array>} 자격증 목록
   */
  async getCertificates(userId) {
    try {
      const certs = await Certificate.findAll({
        where: { userId },
        order: [['certifiedDate', 'DESC']]  // 가장 최근 자격증부터 정렬
      });
      return certs;
    } catch (error) {
      console.error('🚨 어학 자격증 조회 에러:', error.message);
      throw new Error(error.message);
    }
  }
};
