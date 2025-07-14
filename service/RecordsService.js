'use strict';

const { Records, Review } = require('../models');

module.exports = {
  /**
   * 수강 내역 직접 입력
   * @param {Object} data - { courseCode, courseName, credits, grade, semester, type, userId }
   */
  async createDirectInput(data) {
    const required = ['courseCode', 'courseName', 'credits', 'grade', 'semester', 'type'];
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`${field} 항목이 누락되었습니다.`);
      }
    }
    const record = await Records.create(data);
    return { message: '수강 내역이 입력되었습니다.', record };
  },

  /**
   * 수강 내역 캡처본 등록
   */
  async createCaptureRecord(data) {
    if (!data.courseName || !data.userId) {
      throw new Error('과목명(courseName) 또는 사용자 ID(userId)가 필요합니다.');
    }
    const record = await Records.create({ ...data, type: 'capture' });
    return { message: '수강 내역 캡처본이 등록되었습니다.', record };
  },

  /**
   * 수강 내역 PDF 등록
   */
  async createFileRecord(data) {
    if (!data.courseName || !data.userId) {
      throw new Error('과목명(courseName) 또는 사용자 ID(userId)가 필요합니다.');
    }
    const record = await Records.create({ ...data, type: 'pdf' });
    return { message: '수강 내역 PDF가 등록되었습니다.', record };
  },

  /**
   * 내 수강 내역 전체 조회
   */
  async getRecords(userId) {
    const records = await Records.findAll({ where: { userId } });
    return records;
  },

  /**
   * 수강 내역 리뷰 등록
   * @param {Object} param0 - { recordId, userId, content, rating }
   */
  async addReview({ recordId, userId, content, rating }) {
    if (!recordId || !userId || !content || !rating) {
      throw new Error('recordId, userId, content, rating 모두 필요합니다.');
    }
    const review = await Review.create({ recordId, userId, content, rating });
    return { message: '리뷰가 등록되었습니다.', review };
  },

  /**
   * 특정 수강 내역 수정
   */
  async updateRecord(recordId, data) {
    const record = await Records.findByPk(recordId);
    if (!record) throw new Error('수강 내역을 찾을 수 없습니다.');
    await record.update(data);
    return { message: '수강 내역이 수정되었습니다.', record };
  },

  /**
   * 특정 수강 내역 삭제
   */
  async deleteRecord(recordId) {
    const record = await Records.findByPk(recordId);
    if (!record) throw new Error('수강 내역을 찾을 수 없습니다.');
    await record.destroy();
    return { message: '수강 내역이 삭제되었습니다.' };
  }
};
