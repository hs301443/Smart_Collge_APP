"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoomMessages = exports.deleteMessage = exports.sendMessageAdmin = exports.getRoomMessages = exports.removeFromGroup = exports.addToGroup = exports.createGroup = exports.getAdminRooms = void 0;
const server_1 = require("../../server");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const Room_1 = require("../../models/shema/Room");
const Message_1 = require("../../models/shema/Message");
const mongoose_1 = require("mongoose");
// =========================
// Get All Rooms for Admin
// =========================
const getAdminRooms = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin)
        throw new Errors_1.UnauthorizedError("Admin not found");
    const rooms = await Room_1.RoomModel.find({ "participants.user": req.admin._id });
    (0, response_1.SuccessResponse)(res, { rooms });
};
exports.getAdminRooms = getAdminRooms;
// =========================
// Create Group
// =========================
const createGroup = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin || !req.admin._id)
        throw new Errors_1.UnauthorizedError("Admin not found");
    const adminId = req.admin._id.toString();
    const { name, memberIds } = req.body;
    if (!name || !memberIds)
        throw new BadRequest_1.BadRequest("Missing required fields");
    const participants = memberIds.map((id) => ({ user: new mongoose_1.Types.ObjectId(id), role: "User" }));
    participants.push({ user: new mongoose_1.Types.ObjectId(adminId), role: "Admin" });
    const group = await Room_1.RoomModel.create({
        type: "group",
        name,
        participants,
        createdBy: { user: req.admin._id, role: "Admin" },
    });
    participants.forEach((p) => {
        server_1.io.to(p.user.toString()).emit("new-group-notification", { roomId: group._id, name: group.name });
    });
    server_1.io.to(group._id.toString()).emit("group-updated", group);
    (0, response_1.SuccessResponse)(res, { group });
};
exports.createGroup = createGroup;
// =========================
// Add Member to Group
// =========================
const addToGroup = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin || !req.admin._id)
        throw new Errors_1.UnauthorizedError("Admin not found");
    const { roomId, userId, role } = req.body;
    if (!roomId || !userId || !role)
        throw new BadRequest_1.BadRequest("Missing required fields");
    const room = await Room_1.RoomModel.findById(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    if (room.participants.some((p) => p.user.toString() === userId.toString())) {
        throw new BadRequest_1.BadRequest("User already in group");
    }
    room.participants.push({ user: new mongoose_1.Types.ObjectId(userId), role });
    await room.save();
    server_1.io.to(room._id.toString()).emit("group-updated", room);
    server_1.io.to(userId.toString()).emit("added-to-group", { roomId: room._id.toString(), name: room.name });
    (0, response_1.SuccessResponse)(res, { message: "User added to group", room });
};
exports.addToGroup = addToGroup;
// =========================
// Remove Member from Group
// =========================
const removeFromGroup = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin || !req.admin._id)
        throw new Errors_1.UnauthorizedError("Admin not found");
    const { roomId, userId } = req.body;
    if (!roomId || !userId)
        throw new BadRequest_1.BadRequest("Missing required fields");
    const room = await Room_1.RoomModel.findById(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    // ✅ استخدم set لتفادي مشكلة DocumentArray
    room.set("participants", room.participants.filter((p) => p.user.toString() !== userId.toString()));
    await room.save();
    server_1.io.to(room._id.toString()).emit("group-updated", room);
    server_1.io.to(userId.toString()).emit("removed-from-group", { roomId: room._id.toString() });
    (0, response_1.SuccessResponse)(res, { message: "User removed from group", room });
};
exports.removeFromGroup = removeFromGroup;
// =========================
// Get Messages in a Room
// =========================
const getRoomMessages = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin || !req.admin._id)
        throw new Errors_1.UnauthorizedError("Admin not found");
    const { roomId } = req.params;
    if (!roomId)
        throw new BadRequest_1.BadRequest("Missing required fields");
    const messages = await Message_1.MessageModel.find({ room: roomId });
    if (!messages)
        throw new Errors_1.NotFound("Messages not found");
    (0, response_1.SuccessResponse)(res, { messages });
};
exports.getRoomMessages = getRoomMessages;
// =========================
// Send Message as Admin
// =========================
const sendMessageAdmin = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin || !req.admin.id)
        throw new Errors_1.UnauthorizedError("Admin not found");
    const { roomId, content, attachment } = req.body;
    if (!roomId)
        throw new BadRequest_1.BadRequest("roomId is required");
    const room = await Room_1.RoomModel.findById(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    const adminId = req.admin.id;
    const admin = req.admin;
    const message = await Message_1.MessageModel.create({
        room: room._id,
        sender: { user: adminId.toString(), role: "Admin" },
        content: content || null,
        attachment: attachment || null,
        deliveredTo: room.participants.map((p) => p.user.toString()),
    });
    server_1.io.to(room._id.toString()).emit("new-message", {
        id: message._id,
        sender: admin.name,
        role: "Admin",
        content: message.content,
        attachment: message.attachment,
        timestamp: message.createdAt,
    });
    message.deliveredTo
        .filter((uid) => uid.toString() !== adminId.toString())
        .forEach((uid) => {
        server_1.io.to(uid.toString()).emit("new-message-notification", {
            roomId: room._id.toString(),
            messageId: message._id,
            sender: admin.name,
        });
    });
    (0, response_1.SuccessResponse)(res, { message: "Message sent successfully", messageData: message });
};
exports.sendMessageAdmin = sendMessageAdmin;
// =========================
// Delete a Message (Soft Delete)
// =========================
const deleteMessage = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin || !req.admin._id)
        throw new Errors_1.UnauthorizedError("Admin not found");
    const { messageId } = req.params;
    if (!messageId)
        throw new BadRequest_1.BadRequest("Missing required fields");
    const message = await Message_1.MessageModel.findById(messageId);
    if (!message)
        throw new Errors_1.NotFound("Message not found");
    message.isDeleted = true;
    await message.save();
    if (message.room) {
        server_1.io.to(message.room.toString()).emit("message-deleted", { messageId });
    }
    (0, response_1.SuccessResponse)(res, { message: "Message deleted successfully" });
};
exports.deleteMessage = deleteMessage;
// =========================
// Delete All Messages in a Room
// =========================
const deleteRoomMessages = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin || !req.admin._id)
        throw new Errors_1.UnauthorizedError("Admin not found");
    const { roomId } = req.params;
    if (!roomId)
        throw new BadRequest_1.BadRequest("Missing required fields");
    await Message_1.MessageModel.updateMany({ room: roomId }, { $set: { isDeleted: true } });
    server_1.io.to(roomId.toString()).emit("all-messages-deleted", { roomId });
    (0, response_1.SuccessResponse)(res, { message: "All messages in room deleted" });
};
exports.deleteRoomMessages = deleteRoomMessages;
