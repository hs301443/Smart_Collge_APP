"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_1 = require("../../controller/admin/chat");
const authorized_1 = require("../../middlewares/authorized");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// المحادثات
router.get("/conversations", authorized_1.auth, (0, catchAsync_1.catchAsync)(chat_1.getAdminConversations));
// الرسائل
router.get("/messages/:conversationId", authorized_1.auth, (0, catchAsync_1.catchAsync)(chat_1.getMessages));
// إرسال رسالة
router.post("/messages/send", authorized_1.auth, (0, catchAsync_1.catchAsync)(chat_1.sendMessageByAdmin));
// تعليم رسالة واحدة كمقروءة
router.post("/messages/read/message/:messageId", authorized_1.auth, (0, catchAsync_1.catchAsync)(chat_1.markMessageAsRead));
// تعليم كل الرسائل كمقروءة
router.post("/messages/read/:conversationId", authorized_1.auth, (0, catchAsync_1.catchAsync)(chat_1.markAsRead));
// حذف رسالة واحدة
router.delete("/messages/:messageId", authorized_1.auth, (0, catchAsync_1.catchAsync)(chat_1.deleteMessage));
// حذف محادثة كاملة
router.delete("/conversations/:conversationId", authorized_1.auth, (0, catchAsync_1.catchAsync)(chat_1.deleteConversation));
exports.default = router;
