'use strict';
console.log('[CHECK] AWS Key ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('[CHECK] AWS Secret:', process.env.AWS_SECRET_ACCESS_KEY?.slice(0, 4) + '...');


/**
 * 커리큘럼에 담기
 *
 * body Lectures_addtocurriculum_body 
 * authorization String Access Token (type: Bearer)
 * no response value expected for this operation
 **/
exports.lecturesAdd_to_curriculumPOST = function(body,authorization) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * 기초 지식
 *
 * lect_id Integer 
 * returns inline_response_200_12
 **/
exports.lecturesBasic_knowledgeGET = function(lect_id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "basic_knowledge" : [ {
    "topic" : "topic",
    "description" : "description"
  }, {
    "topic" : "topic",
    "description" : "description"
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 강의 내용 확인
 *
 * lect_id Integer 
 * returns inline_response_200_10
 **/
exports.lecturesDetailsGET = function(lect_id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "professor" : "professor",
  "lect_id" : 0,
  "credits" : 6,
  "name" : "name",
  "description" : "description"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 선후수 과목
 *
 * lect_id Integer 
 * returns inline_response_200_11
 **/
exports.lecturesPre_requisiteGET = function(lect_id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "pre_requisites" : [ {
    "lect_id" : 0,
    "name" : "name",
    "type" : "필수"
  }, {
    "lect_id" : 0,
    "name" : "name",
    "type" : "필수"
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 강의 리뷰 조회
 *
 * lect_id Integer 
 * returns inline_response_200_13
 **/
exports.lecturesReviewsGET = function(lect_id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "reviews" : [ {
    "date" : "2000-01-23T04:56:07.000+00:00",
    "review_id" : 0,
    "rate" : 6,
    "comment" : "comment",
    "user" : "user"
  }, {
    "date" : "2000-01-23T04:56:07.000+00:00",
    "review_id" : 0,
    "rate" : 6,
    "comment" : "comment",
    "user" : "user"
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 학습 로드맵
 *
 * lect_id Integer 
 * returns inline_response_200_14
 **/
exports.lecturesRoadmapGET = function(lect_id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "roadmap" : [ {
    "description" : "description",
    "step" : "step"
  }, {
    "description" : "description",
    "step" : "step"
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 과목명 검색
 *
 * name String 
 * returns inline_response_200_15
 **/
exports.lecturesSearch_by_nameGET = function(name) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "lectures" : [ {
    "professor" : "professor",
    "lect_id" : 0,
    "name" : "name"
  }, {
    "professor" : "professor",
    "lect_id" : 0,
    "name" : "name"
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 교수명 검색
 *
 * professor String 
 * returns inline_response_200_15
 **/
exports.lecturesSearch_by_professorGET = function(professor) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "lectures" : [ {
    "professor" : "professor",
    "lect_id" : 0,
    "name" : "name"
  }, {
    "professor" : "professor",
    "lect_id" : 0,
    "name" : "name"
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**
 * 강의계획서 파일명 기반 검색
 *
 * query String 검색어 (교수명 또는 과목명)
 * returns structured lecture list
 */
exports.lecturesSyllabusSearchGET = function(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: process.env.AWS_FOLDER_PREFIX,
      };

      const data = await s3.listObjectsV2(params).promise();

      const lectures = data.Contents
        .filter(obj => obj.Size > 0)
        .map(obj => {
          const fileName = obj.Key.split('/').pop().replace('.pdf', '');
          const [code, section, professor, name] = fileName.split('-');
          return {
            code,
            section,
            professor,
            name,
            url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`
          };
        });

      if (!query) return resolve(lectures);

      const filtered = lectures.filter(l =>
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.professor.toLowerCase().includes(query.toLowerCase()) ||
        l.code.toLowerCase().includes(query.toLowerCase())
      );

      resolve(filtered);
    } catch (err) {
      reject(err);
    }
  });
};

// --- S3 강의계획서 추가 확장 기능 ---

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 });

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

// 전체 리스트 반환 (req, res 직접 X, 서비스 로직만)
exports.getSyllabusList = async () => {
  return await fetchAllSyllabus();
};

// 과목명 기준 검색
exports.searchBySubject = async (name) => {
  const list = await fetchAllSyllabus();
  return list.filter(i => i.name && i.name.includes(name));
};

// 교수명 기준 검색
exports.searchByProfessor = async (professor) => {
  const list = await fetchAllSyllabus();
  return list.filter(i => i.professor && i.professor.includes(professor));
};

// 과목별 그룹핑
exports.groupedBySubject = async () => {
  const list = await fetchAllSyllabus();
  const grouped = {};
  list.forEach(i => {
    if (!grouped[i.name]) grouped[i.name] = [];
    grouped[i.name].push(i);
  });
  return grouped;
};

// 학기별 그룹핑
exports.groupedBySemester = async () => {
  const list = await fetchAllSyllabus();
  const grouped = {};
  list.forEach(i => {
    if (!grouped[i.semester]) grouped[i.semester] = [];
    grouped[i.semester].push(i);
  });
  return grouped;
};

// S3 signed URL 발급
exports.getSignedPdfView = async (key) => {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Expires: 300 // 5분
  });
};

// 과목명 목록만 추출
exports.getSubjectList = async () => {
  const list = await fetchAllSyllabus();
  return [...new Set(list.map(i => i.name))];
};

// 교수명 목록만 추출
exports.getProfessorList = async () => {
  const list = await fetchAllSyllabus();
  return [...new Set(list.map(i => i.professor))];
};
