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
          attributes: [
            'name', 'student_id', 'major', 'grade', 'semester', 'phone', 
            'onboarding_completed', 'interests', 'completed_credits', 
            'career', 'industry', 'remaining_semesters', 'max_credits_per_term',
            'enrollment_year', 'graduation_year', 'updated_at'
          ]
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
        interests: user.UserProfile?.interests || [],
        completedCredits: user.UserProfile?.completed_credits || 0,
        career: user.UserProfile?.career || '',
        industry: user.UserProfile?.industry || '',
        remainingSemesters: user.UserProfile?.remaining_semesters || 0,
        maxCreditsPerTerm: user.UserProfile?.max_credits_per_term || 18,
        enrollmentYear: user.UserProfile?.enrollment_year || null,
        graduationYear: user.UserProfile?.graduation_year || null,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.UserProfile?.updated_at
      };

      return profile;
    } catch (error) {
      console.error('프로필 조회 에러:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * 사용자 프로필 수정
   * @param {number} userId - 사용자 ID
   * @param {Object} data - 수정할 프로필 데이터
   * @returns {Promise<Object>} 수정된 사용자 정보
   */
  async updateProfile(userId, data) {
    try {
      const { UserProfile } = require('../models');

      // User 테이블 업데이트 필드
      const userFields = {};
      if (data.phone) userFields.phone = data.phone;
      if (data.major) userFields.major = data.major;

      // UserProfile 테이블 업데이트 필드
      const profileFields = {};
      if (data.username || data.name) profileFields.name = data.username || data.name;
      if (data.studentId) profileFields.student_id = data.studentId;
      if (data.major) profileFields.major = data.major;
      if (data.grade !== undefined) profileFields.grade = data.grade;
      if (data.semester !== undefined) profileFields.semester = data.semester;
      if (data.phone) profileFields.phone = data.phone;
      if (data.interests) profileFields.interests = JSON.stringify(data.interests);
      if (data.completedCredits !== undefined) profileFields.completed_credits = data.completedCredits;
      if (data.career) profileFields.career = data.career;
      if (data.industry) profileFields.industry = data.industry;
      if (data.remainingSemesters !== undefined) profileFields.remaining_semesters = data.remainingSemesters;
      if (data.maxCreditsPerTerm !== undefined) profileFields.max_credits_per_term = data.maxCreditsPerTerm;
      if (data.enrollmentYear !== undefined) profileFields.enrollment_year = data.enrollmentYear;
      if (data.graduationYear !== undefined) profileFields.graduation_year = data.graduationYear;
      if (data.onboardingCompleted !== undefined) profileFields.onboarding_completed = data.onboardingCompleted;
      
      profileFields.updated_at = new Date();

      // User 테이블 업데이트
      if (Object.keys(userFields).length > 0) {
        const user = await User.findByPk(userId);
        if (!user) {
          throw new Error('수정할 사용자를 찾을 수 없습니다.');
        }
        await user.update(userFields);
      }

      // UserProfile 테이블 업데이트 (upsert)
      if (Object.keys(profileFields).length > 0) {
        const [userProfile, created] = await UserProfile.findOrCreate({
          where: { userId },
          defaults: { userId, ...profileFields }
        });

        if (!created) {
          await userProfile.update(profileFields);
        }
      }

      // 업데이트된 프로필 정보 반환
      const updatedProfile = await this.getProfile(userId);
      
      return { 
        message: '프로필이 수정되었습니다.',
        user: updatedProfile
      };
    } catch (error) {
      console.error('프로필 수정 에러:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * 온보딩 완료 처리
   * @param {number} userId - 사용자 ID
   * @param {Object} onboardingData - 온보딩 데이터
   * @returns {Promise<Object>} 결과 메시지
   */
  async completeOnboarding(userId, onboardingData) {
    try {
      const updateData = {
        ...onboardingData,
        onboardingCompleted: true
      };

      await this.updateProfile(userId, updateData);
      
      return { message: '온보딩이 완료되었습니다.' };
    } catch (error) {
      console.error('온보딩 완료 처리 에러:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * 사용자별 총 이수 학점 및 평균 평점 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise<Object>} 학점 요약 정보
   */
  async getCreditSummary(userId) {
    try {
      const records = await Records.findAll({
        where: { userId },
        attributes: ['credits', 'grade', 'type']
      });

      if (!records || records.length === 0) {
        return {
          totalCredits: 0,
          majorCredits: 0,
          liberalCredits: 0,
          averageGrade: 0
        };
      }

      let totalCredits = 0;
      let majorCredits = 0;
      let liberalCredits = 0;
      let gradeSum = 0;
      let gradeCount = 0;

      records.forEach(record => {
        const credits = parseInt(record.credits) || 0;
        totalCredits += credits;

        // 카테고리별 학점 분류
        if (record.type && (record.type.includes('MR') || record.type.includes('ME'))) {
          majorCredits += credits;
        } else if (record.type && (record.type.includes('GR') || record.type.includes('GE'))) {
          liberalCredits += credits;
        }
        
        // 평점 계산 (A+=4.5, A=4.0, B+=3.5, B=3.0, C+=2.5, C=2.0, D+=1.5, D=1.0, F=0)
        if (record.grade) {
          const gradeValue = this.convertGradeToNumber(record.grade);
          if (gradeValue >= 0) {
            gradeSum += gradeValue * credits;
            gradeCount += credits;
          }
        }
      });

      const averageGrade = gradeCount > 0 ? (gradeSum / gradeCount).toFixed(2) : 0;

      return {
        totalCredits,
        majorCredits,
        liberalCredits,
        averageGrade: parseFloat(averageGrade)
      };
    } catch (error) {
      console.error('학점 요약 조회 에러:', error.message);
      throw new Error(error.message);
    }
  },

  /**
   * 문자열 성적을 숫자로 변환
   * @param {string} grade - 문자열 성적 (A+, A, B+, B, C+, C, D+, D, F)
   * @returns {number} 숫자 성적
   */
  convertGradeToNumber(grade) {
    const gradeMap = {
      'A+': 4.5, 'A': 4.0, 'A-': 3.7,
      'B+': 3.5, 'B': 3.0, 'B-': 2.7,
      'C+': 2.5, 'C': 2.0, 'C-': 1.7,
      'D+': 1.5, 'D': 1.0, 'D-': 0.7,
      'F': 0, 'P': -1, 'NP': -1 // P/NP는 평점 계산에서 제외
    };
    
    return gradeMap[grade.toUpperCase()] !== undefined ? gradeMap[grade.toUpperCase()] : -1;
  }
};