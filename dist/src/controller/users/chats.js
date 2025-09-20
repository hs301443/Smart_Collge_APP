"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoom = exports.deleteMessage = exports.sendMessage = exports.getRoomMessages = exports.createRoom = exports.getUserRooms = void 0;
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const Room_1 = require("../../models/shema/Room");
const Message_1 = require("../../models/shema/Message");
const server_1 = require("../../server"); // socket.io instance
// ✅ جلب كل الرومات الخاصة بالـ User
const getUserRooms = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    const rooms = await Room_1.RoomModel.find({
        "participants.user": req.user.id,
        isDeleted: { $ne: true },
    }).sort({ updatedAt: -1 });
    (0, response_1.SuccessResponse)(res, { rooms });
};
exports.getUserRooms = getUserRooms;
// ✅ إنشاء روم جديد مع User أو Admin
const createRoom = async (req, res) => {
    const { participants, type, name } = req.body;
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not found");
    if (!participants || participants.length === 0)
        throw new BadRequest_1.BadRequest("Participants are required");
    const room = await Room_1.RoomModel.create({
        type: type || "direct",
        name: name || null,
        participants: [{ user: req.user.id, role: "User" }, ...participants],
        createdBy: { user: req.user.id, role: "User" },
    });
    // ريل تايم: إخطار كل المشاركين بالروم الجديد
    for (const p of room.participants) {
        server_1.io.to(p.user.toString()).emit("new-room", { room });
    }
    (0, response_1.SuccessResponse)(res, { message: "Room created successfully", room });
};
exports.createRoom = createRoom;
// ✅ جلب كل الرسائل في روم معين
const getRoomMessages = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not found");
    const { roomId } = req.params;
    const messages = await Message_1.MessageModel.find({
        room: roomId,
        isDeleted: { $ne: true },
    }).sort({ createdAt: 1 });
    (0, response_1.SuccessResponse)(res, { messages });
};
exports.getRoomMessages = getRoomMessages;
// ✅ إرسال رسالة في روم
const sendMessage = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not found");
    const { roomId, content, attachment } = req.body;
    const room = await Room_1.RoomModel.findById(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    const messages = await Message_1.MessageModel.create({
        room: roomId,
        sender: { user: req.user.id, role: "User" },
        content: content || null,
        attachment: attachment || null,
        deliveredTo: room.participants.map((p) => p.user.toString()),
    });
    // ريل تايم: إرسال الرسالة لكل المشاركين في الغرفة
    server_1.io.to(roomId).emit("new-message", {
        id: messages._id,
        sender: req.user.name,
        role: "User",
        content: messages.content,
        attachment: messages.attachment,
        timestamp: messages.createdAt,
    });
    (0, response_1.SuccessResponse)(res, { message: "Message sent successfully", messages });
};
exports.sendMessage = sendMessage;
// ✅ حذف رسالة (soft delete)
const deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not found");
    const message = await Message_1.MessageModel.findById(messageId);
    if (!message)
        throw new Errors_1.NotFound("Message not found");
    if (!message.sender || message.sender.user.toString() !== req.user.id) {
        throw new Errors_1.UnauthorizedError("Unauthorized");
    }
    message.isDeleted = true;
    await message.save();
    // إخطار المشاركين بالحذف
    if (message.room) {
        server_1.io.to(message.room.toString()).emit("message-deleted", { messageId });
    }
    (0, response_1.SuccessResponse)(res, { message: "Message deleted successfully" });
};
exports.deleteMessage = deleteMessage;
// ✅ حذف روم (soft delete)
const deleteRoom = async (req, res) => {
    const { roomId } = req.params;
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not found");
    const userId = req.user.id;
    const room = await Room_1.RoomModel.findById(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    // إخطار كل المشاركين قبل الحذف
    room.participants.forEach((p) => {
        server_1.io.to(p.user.toString()).emit("room-deleted", { roomId });
    });
    room.isDeleted = true;
    await room.save();
    (0, response_1.SuccessResponse)(res, { message: "Room deleted successfully" });
};
exports.deleteRoom = deleteRoom;
