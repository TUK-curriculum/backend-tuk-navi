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
          attributes: ['name', 'student_id', 'major', 'grade', 'semester', 'phone', 'onboarding_completed', 'interests', 'completed_credits', 'career', 'industry', 'remaining_semesters', 'max_credits_per_term']
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
        interests: user.UserProfile?.interests ? JSON.parse(user.UserProfile.interests) : [],
        completedCredits: user.UserProfile?.completed_credits || 0,
        career: user.UserProfile?.career || '',
        industry: user.UserProfile?.industry || '',
        remainingSemesters: user.UserProfile?.remaining_semesters || 0,
        maxCreditsPerTerm: user.UserProfile?.max_credits_per_term || 18,
        provider: user.provider,
        createdAt: user.createdAt
      };

      return profile;
    } catch (error) {
      console.error('프로필 조회 에러:', error.message);
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
      console.error('프로필 수정 에러:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * 온보딩 완료 상태 업데이트
   * @param {number} userId - 사용자 ID
   * @param {Object} onboardingData - 온보딩 데이터
   * @returns {Promise<Object>} 업데이트 결과
   */
  async completeOnboarding(userId, onboardingData = {}) {
    try {
      const { UserProfile } = require('../models');

      let userProfile = await UserProfile.findOne({
        where: { userId: userId }
      });

      if (!userProfile) {
        // 프로필이 없으면 새로 생성
        userProfile = await UserProfile.create({
          userId: userId,
          name: onboardingData.name || '',
          student_id: onboardingData.studentId || '',
          major: onboardingData.department || '',
          grade: parseInt(onboardingData.year) || 1,
          semester: 1,
          phone: '',
          onboarding_completed: true,
          interests: onboardingData.interests ? JSON.stringify(onboardingData.interests) : '[]',
          completed_credits: parseInt(onboardingData.completedCredits) || 0,
          career: onboardingData.career || '',
          industry: onboardingData.industry || '',
          remaining_semesters: parseInt(onboardingData.remainingSemesters) || 0,
          max_credits_per_term: parseInt(onboardingData.maxCreditsPerTerm) || 18
        });
      } else {
        // 기존 프로필 업데이트
        await userProfile.update({
          name: onboardingData.name || userProfile.name,
          student_id: onboardingData.studentId || userProfile.student_id,
          major: onboardingData.department || userProfile.major,
          grade: parseInt(onboardingData.year) || userProfile.grade,
          onboarding_completed: true,
          interests: onboardingData.interests ? JSON.stringify(onboardingData.interests) : userProfile.interests,
          completed_credits: parseInt(onboardingData.completedCredits) || userProfile.completed_credits || 0,
          career: onboardingData.career || userProfile.career,
          industry: onboardingData.industry || userProfile.industry,
          remaining_semesters: parseInt(onboardingData.remainingSemesters) || userProfile.remaining_semesters || 0,
          max_credits_per_term: parseInt(onboardingData.maxCreditsPerTerm) || userProfile.max_credits_per_term || 18
        });
      }

      console.log(`User ${userId} onboarding completed with data:`, {
        name: onboardingData.name,
        grade: onboardingData.year,
        completedCredits: onboardingData.completedCredits,
        interests: onboardingData.interests
      });

      return { message: '온보딩이 완료되었습니다.' };
    } catch (error) {
      console.error('온보딩 완료 에러:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * 사용자 총 이수 학점, 전공/교양 학점, 평균 평점 조회
   */
  async getCreditSummary(userId) {
    try {
      const records = await Records.findAll({
        where: { userId }
      });

      let totalCredits = 0;
      let majorCredits = 0;
      let liberalCredits = 0;
      let gradeSum = 0;
      let gradedCredits = 0;

      const gradeMap = {
        'A+': 4.5, 'A0': 4.0,
        'B+': 3.5, 'B0': 3.0,
        'C+': 2.5, 'C0': 2.0,
        'D+': 1.5, 'D0': 1.0,
        'F': 0.0,
        'P': null, 'NP': null
      };

      // 강의코드 기준으로 중복 제거 후 최고 성적만 선택
      const bestRecords = {};
      records.forEach(record => {
        const key = record.courseCode || record.courseName;
        const numericGrade = gradeMap[record.grade];

        if (!bestRecords[key]) {
          bestRecords[key] = record;
        } else {
          const existingGrade = gradeMap[bestRecords[key].grade];
          if ((numericGrade ?? -1) > (existingGrade ?? -1)) {
            bestRecords[key] = record;
          }
        }
      });

      // 중복 제거된 기록으로 학점 계산
      Object.values(bestRecords).forEach((record) => {
        const credits = record.credits || 0;

        // P/NP 포함 여부 확인
        if (!record.grade || record.grade === 'P' || record.grade === 'NP') {
          totalCredits += credits;
          if (['ME', 'MR'].includes(record.type)) {
            majorCredits += credits;
          } else if (['GE', 'GR'].includes(record.type)) {
            liberalCredits += credits;
          }
          // 성적에는 반영하지 않음
          return;
        }

        // 일반 성적 처리
        totalCredits += credits;
        if (['ME', 'MR'].includes(record.type)) {
          majorCredits += credits;
        } else if (['GE', 'GR'].includes(record.type)) {
          liberalCredits += credits;
        }

        const numericGrade = gradeMap[record.grade];
        if (numericGrade !== undefined && numericGrade !== null) {
          gradeSum += numericGrade * credits;
          gradedCredits += credits;
        }
      });

      const averageGrade =
        gradedCredits > 0 ? (gradeSum / gradedCredits).toFixed(2) : null;

      return {
        totalCredits,
        majorCredits,
        liberalCredits,
        averageGrade
      };
    } catch (error) {
      console.error('학점 요약 조회 에러:', error.message);
      throw new Error(error.message);
    }
  }
};
