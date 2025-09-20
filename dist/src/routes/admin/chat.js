"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_1 = require("../../controller/admin/chat");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// ✅ Admin Routes for Chat
router.get("/rooms", (0, catchAsync_1.catchAsync)(chat_1.getAdminRooms));
// إنشاء جروب جديد
router.post("/rooms/group", (0, catchAsync_1.catchAsync)(chat_1.createGroup));
// إضافة عضو للجروب
router.post("/rooms/group/add", (0, catchAsync_1.catchAsync)(chat_1.addToGroup));
// إزالة عضو من الجروب
router.post("/rooms/group/remove", (0, catchAsync_1.catchAsync)(chat_1.removeFromGroup));
// جلب كل الرسائل في روم معين
router.get("/rooms/:roomId/messages", (0, catchAsync_1.catchAsync)(chat_1.getRoomMessages));
// مسح رسالة واحدة (Soft Delete)
router.delete("/messages/:messageId", (0, catchAsync_1.catchAsync)(chat_1.deleteMessage));
// مسح كل الرسائل في روم (Soft Delete)
router.delete("/rooms/:roomId/messages", (0, catchAsync_1.catchAsync)(chat_1.deleteRoomMessages)); // Delete room
router.post("/rooms/:roomId/messages", (0, catchAsync_1.catchAsync)(chat_1.sendMessageAdmin));
exports.default = router;
