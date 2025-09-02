'use strict';


/**
 * 대화 로그 저장
 *
 * body Chat_chattinglogs_body 
 * authorization String Access Token (type: Bearer)
 * no response value expected for this operation
 **/
exports.chatChatting_logsPOST = function(body,authorization) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * 대화 로그 조회
 *
 * authorization String Access Token (type: Bearer)
 * userId Integer 
 * returns inline_response_200_9
 **/
exports.chatChatting_logsuserIdGET = function(authorization,userId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "logs" : [ {
    "session_id" : 0,
    "message" : "message",
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
  }, {
    "session_id" : 0,
    "message" : "message",
    "timestamp" : "2000-01-23T04:56:07.000+00:00"
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
 * 챗봇 메시지 처리
 *
 * body Chat_messages_body 
 * authorization String Access Token (type: Bearer)
 * returns inline_response_200_6
 **/
exports.chatMessagesPOST = function(body,authorization) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "response" : "response"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 사용자 기본 정보 전달
 *
 * body Chat_userinfo_body 
 * authorization String Access Token (type: Bearer)
 * returns inline_response_200_8
 **/
exports.chatUser_infoPOST = function(body,authorization) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "message" : "사용자 정보가 정상적으로 저장되었습니다."
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 사용자 기본 정보 가져오기
 *
 * authorization String Access Token (type: Bearer)
 * userId Integer 
 * returns inline_response_200_7
 **/
exports.chatUser_infouserIdGET = function(authorization,userId) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "major" : "major",
  "userId" : 0,
  "grade" : 1,
  "admission_year" : 6,
  "email" : "email",
  "username" : "username",
  "status" : "재학"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 내 커리큘럼으로 추가
 *
 * body Curriculums_fromchatbot_body 
 * authorization String Access Token (type: Bearer)
 * returns inline_response_201
 **/
exports.curriculumsFrom_chatbotPOST = function(body,authorization) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "message" : "해당 커리큘럼이 나의 커리큘럼으로 추가되었습니다.",
  "curri_id" : 0
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 관심 분야 삭제
 *
 * authorization String Access Token (type: Bearer)
 * no response value expected for this operation
 **/
exports.usersPreferenceDELETE = function(authorization) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * 관심 분야 조회
 *
 * authorization String Access Token (type: Bearer)
 * returns inline_response_200_5
 **/
exports.usersPreferenceGET = function(authorization) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "preferences" : [ "preferences", "preferences" ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * 관심 분야 및 목적 설정
 *
 * body Users_preference_body 
 * authorization String Access Token (type: Bearer)
 * no response value expected for this operation
 **/
exports.usersPreferencePOST = function(body,authorization) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * 수강 내역 관리
 *
 * authorization String Access Token (type: Bearer)
 * returns inline_response_200_4
 **/
exports.usersRecordsGET = function(authorization) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "records" : [ {
    "score" : 1,
    "lect_id" : 0,
    "credits" : 6,
    "name" : "name"
  }, {
    "score" : 1,
    "lect_id" : 0,
    "credits" : 6,
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
 * 학적 상태 확인
 *
 * authorization String Access Token (type: Bearer)
 * returns inline_response_200_3
 **/
exports.usersStatusGET = function(authorization) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "status" : "재학"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

