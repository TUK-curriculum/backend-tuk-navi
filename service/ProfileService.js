// service/ProfileService.js
'use strict';

const { User, Records } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  /**
   * 사용자 기본 프로필 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 사용자 정보
   */
  async getProfile(userId) {
    try {
      const { UserProfile } = require('../models');

      // User와 UserProfile 조인해서 조회
      const user = await User.findByPk(userId, {
        attributes: ['id', 'email', 'major', 'phone', 'provider', 'createdAt'],
        include: [{
          model: UserProfile,
          required: false,
          attributes: ['name', 'student_id', 'major', 'grade', 'semester', 'phone', 'onboarding_completed']
        }]
      });

      if (!user) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      // 프로필 정보 통합
      const profile = {
        userId: user.id,
        email: user.email,
        name: user.UserProfile?.name || '',
        studentId: user.UserProfile?.student_id || '',
        major: user.UserProfile?.major || user.major || '',
        grade: user.UserProfile?.grade || 1,
        semester: user.UserProfile?.semester || 1,
        phone: user.UserProfile?.phone || user.phone || '',
        onboardingCompleted: user.UserProfile?.onboarding_completed || false,
        provider: user.provider,
        createdAt: user.createdAt
      };

      return profile;
    } catch (error) {
      console.error('🚨 프로필 조회 에러:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * 사용자 기본 프로필 수정
   * @param {number} userId - 사용자 ID
   * @param {Object} data - 수정할 프로필 데이터
   * @returns {Promise<Object>} 수정된 사용자 정보
   */
  async updateProfile(userId, data) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('수정할 사용자를 찾을 수 없습니다.');
      }

      const fieldsToUpdate = {};
      if (data.username) fieldsToUpdate.username = data.username;
      if (data.phone) fieldsToUpdate.phone = data.phone;
      if (data.major) fieldsToUpdate.major = data.major;

      await user.update(fieldsToUpdate);
      return { message: '프로필이 수정되었습니다.', user };
    } catch (error) {
      console.error('🚨 프로필 수정 에러:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * 온보딩 완료 상태 업데이트
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 업데이트 결과
   */
  async completeOnboarding(userId) {
    try {
      const { UserProfile } = require('../models');

      const userProfile = await UserProfile.findOne({
        where: { user_id: userId }
      });

      if (!userProfile) {
        throw new Error('사용자 프로필을 찾을 수 없습니다.');
      }

      await userProfile.update({ onboarding_completed: true });
      console.log(`✅ User ${userId} onboarding completed`);

      return { message: '온보딩이 완료되었습니다.' };
    } catch (error) {
      console.error('🚨 온보딩 완료 에러:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * 사용자 총 이수 학점 및 평균 평점 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 이수 학점, 평균 평점
   */
  async getCreditSummary(userId) {
    try {
      const records = await Records.findAll({
        where: {
          userId,
          grade: { [Op.ne]: null }
        }
      });

      let totalCredits = 0;
      let gradeSum = 0;
      let gradedCredits = 0;

      records.forEach(record => {
        totalCredits += record.credits || 0;

        const numericGrade = parseFloat(record.grade);
        if (!isNaN(numericGrade)) {
          gradeSum += numericGrade * (record.credits || 0);
          gradedCredits += record.credits || 0;
        }
      });

      const averageGrade = gradedCredits > 0
        ? (gradeSum / gradedCredits).toFixed(2)
        : null;

      return {
        totalCredits,
        averageGrade
      };
    } catch (error) {
      console.error('🚨 학점 요약 조회 에러:', error.message);
      throw new Error(error.message);
    }
  }
};

console.log(`✅ User ${userId} onboarding completed`);

return { message: '온보딩이 완료되었습니다.' };
    } catch (error) {
  console.error('🚨 온보딩 완료 에러:', error.message);
  throw new Error(error.message);
}
  },

  /**
   * 사용자 총 이수 학점 및 평균 평점 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 이수 학점, 평균 평점
   */
  async getCreditSummary(userId) {
  try {
    const records = await Records.findAll({
      where: {
        userId,
        grade: { [Op.ne]: null }
      }
    });

    let totalCredits = 0;
    let gradeSum = 0;
    let gradedCredits = 0;

    records.forEach(record => {
      totalCredits += record.credits || 0;

      const numericGrade = parseFloat(record.grade);
      if (!isNaN(numericGrade)) {
        gradeSum += numericGrade * (record.credits || 0);
        gradedCredits += record.credits || 0;
      }
    });

    const averageGrade = gradedCredits > 0
      ? (gradeSum / gradedCredits).toFixed(2)
      : null;

    return {
      totalCredits,
      averageGrade
    };
  } catch (error) {
    console.error('🚨 학점 요약 조회 에러:', error.message);
    throw new Error(error.message);
  }
}
};
