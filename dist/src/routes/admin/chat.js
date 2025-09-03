"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_1 = require("../../controller/admin/chat");
const authorized_1 = require("../../middlewares/authorized");
const router = (0, express_1.Router)();
// المحادثات
router.get("/conversations/:adminId", authorized_1.auth, chat_1.getConversations);
// الرسائل
router.get("/messages/:conversationId", authorized_1.auth, chat_1.getMessages);
// إرسال رسالة
router.post("/messages/send/:conversationId", authorized_1.auth, chat_1.sendMessage);
// تعليم رسالة واحدة كمقروءة
router.post("/messages/read/message/:messageId", authorized_1.auth, chat_1.markMessageAsRead);
// تعليم كل الرسائل كمقروءة
router.post("/messages/read/:conversationId", authorized_1.auth, chat_1.markAsRead);
// حذف رسالة واحدة
router.delete("/messages/:messageId", authorized_1.auth, chat_1.deleteMessage);
// حذف محادثة كاملة
router.delete("/conversations/:conversationId", authorized_1.auth, chat_1.deleteConversation);
exports.default = router;
