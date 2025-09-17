"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_1 = require("../../controller/admin/chat");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// ✅ Admin Routes for Chat
router.post("/rooms", (0, catchAsync_1.catchAsync)(chat_1.adminCreateRoom)); // Create room
router.post("/rooms/:roomId/join", (0, catchAsync_1.catchAsync)(chat_1.adminJoinRoom)); // Join room
router.post("/rooms/:roomId/messages", (0, catchAsync_1.catchAsync)(chat_1.adminSendMessage)); // Send message
router.delete("/messages/:messageId", (0, catchAsync_1.catchAsync)(chat_1.adminDeleteMessage)); // Delete message
router.delete("/rooms/:roomId", (0, catchAsync_1.catchAsync)(chat_1.adminDeleteRoom)); // Delete room
exports.default = router;
