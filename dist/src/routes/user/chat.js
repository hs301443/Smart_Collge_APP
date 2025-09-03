"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chats_1 = require("../../controller/users/chats");
const catchAsync_1 = require("../../utils/catchAsync");
const authenticated_1 = require("../../middlewares/authenticated");
const router = (0, express_1.Router)();
// المحادثات
router.get("/conversations", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(chats_1.getUserConversations));
router.get("/messages/:conversationId", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(chats_1.getUserMessages));
// إرسال رسالة
router.post("/messages/send", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(chats_1.sendMessageByUser));
// تعليم رسالة كمقروءة
router.post("/messages/read/message/:messageId", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(chats_1.markUserMessageAsRead));
router.post("/messages/read/:conversationId", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(chats_1.markUserConversationAsRead));
// حذف رسالة ومحادثة
router.delete("/messages/:messageId", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(chats_1.deleteUserMessage));
router.delete("/conversations/:conversationId", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(chats_1.deleteUserConversation));
// عدد الرسائل الغير مقروءة
router.get("/unread/count", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(chats_1.getUserUnreadCount));
exports.default = router;
