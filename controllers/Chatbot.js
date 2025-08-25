// controllers/Chatbot.js
const express = require('express');
const router = express.Router();
const ChatbotHandlers = require('../service/ChatbotService');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * [POST] /chatbot/chatting-logs
 */
router.post('/chatting-logs', authMiddleware, (req, res, next) => {
  ChatbotHandlers.chatChatting_logsPOST(req, res, next, req.body, req.headers.authorization);
});

/**
 * [GET] /chatbot/chatting-logs/:userId
 */
router.get('/chatting-logs/:userId', authMiddleware, (req, res, next) => {
  ChatbotHandlers.chatChatting_logsuserIdGET(req, res, next, req.headers.authorization, req.params.userId);
});

/**
 * [POST] /chatbot/messages
 */
router.post('/messages', authMiddleware, (req, res, next) => {
  ChatbotHandlers.chatMessagesPOST(req, res, next, req.body, req.headers.authorization);
});

/**
 * [POST] /chatbot/user-info
 */
router.post('/user-info', authMiddleware, (req, res, next) => {
  ChatbotHandlers.chatUser_infoPOST(req, res, next, req.body, req.headers.authorization);
});

/**
 * [GET] /chatbot/user-info/:userId
 */
router.get('/user-info/:userId', authMiddleware, (req, res, next) => {
  ChatbotHandlers.chatUser_infoUserIdGET(req, res, next, req.headers.authorization, req.params.userId);
});

/**
 * [POST] /chatbot/from-chatbot
 */
router.post('/from-chatbot', authMiddleware, (req, res, next) => {
  ChatbotHandlers.curriculumsFrom_chatbotPOST(req, res, next, req.body, req.headers.authorization);
});

/**
 * [GET] /chatbot/status
 */
router.get('/status', authMiddleware, (req, res, next) => {
  ChatbotHandlers.usersStatusGET(req, res, next, req.headers.authorization);
});

/**
 * [GET] /chatbot/preference
 */
router.get('/preference', authMiddleware, (req, res, next) => {
  ChatbotHandlers.usersPreferenceGET(req, res, next, req.headers.authorization);
});

/**
 * [POST] /chatbot/preference
 */
router.post('/preference', authMiddleware, (req, res, next) => {
  ChatbotHandlers.usersPreferencePOST(req, res, next, req.body, req.headers.authorization);
});

/**
 * [DELETE] /chatbot/preference
 */
router.delete('/preference', authMiddleware, (req, res, next) => {
  ChatbotHandlers.usersPreferenceDELETE(req, res, next, req.headers.authorization);
});

/**
 * [GET] /chatbot/records
 */
router.get('/records', authMiddleware, (req, res, next) => {
  ChatbotHandlers.usersRecordsGET(req, res, next, req.headers.authorization);
});

module.exports = router;
