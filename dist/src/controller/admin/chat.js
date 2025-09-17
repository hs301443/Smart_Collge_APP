"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDeleteRoom = exports.adminDeleteMessage = exports.adminSendMessage = exports.adminJoinRoom = exports.adminCreateRoom = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Room_1 = require("../../models/shema/Room");
const Message_1 = require("../../models/shema/Message");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
// ✅ Admin Create Room
const adminCreateRoom = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin)
        throw new Errors_1.UnauthorizedError("super admin only");
    const { name, description, isPrivate } = req.body;
    if (!name)
        throw new BadRequest_1.BadRequest("Room name is required");
    const room = await Room_1.RoomModel.create({
        name,
        description,
        isPrivate,
        createdBy: {
            id: req.admin._id,
            role: "Admin",
        },
        admins: [req.admin._id],
    });
    (0, response_1.SuccessResponse)(res, { message: "Room created successfully", room });
};
exports.adminCreateRoom = adminCreateRoom;
// ✅ Admin Join Room (force join if needed)
const adminJoinRoom = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin) {
        throw new Errors_1.UnauthorizedError("super admin only");
    }
    if (!req.admin._id) {
        throw new Errors_1.UnauthorizedError("Invalid admin ID");
    }
    const { roomId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(roomId)) {
        throw new BadRequest_1.BadRequest("Invalid room ID");
    }
    const room = await Room_1.RoomModel.findById(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    const adminId = req.admin._id;
    if (room.admins.includes(adminId)) {
        throw new BadRequest_1.BadRequest("Already an admin in this room");
    }
    room.admins.push(adminId);
    await room.save();
    return (0, response_1.SuccessResponse)(res, { message: "Joined room successfully", room });
};
exports.adminJoinRoom = adminJoinRoom;
// ✅ Admin Send Message
const adminSendMessage = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin)
        throw new Errors_1.UnauthorizedError("super admin only");
    const { roomId } = req.params;
    const { text } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(roomId)) {
        throw new BadRequest_1.BadRequest("Invalid room ID");
    }
    const room = await Room_1.RoomModel.findById(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    const messages = await Message_1.MessageModel.create({
        room: roomId,
        sender: req.admin._id,
        text,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Message sent successfully", messages });
};
exports.adminSendMessage = adminSendMessage;
// ✅ Admin Delete Message
const adminDeleteMessage = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin)
        throw new Errors_1.UnauthorizedError("super admin only");
    const { messageId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(messageId)) {
        throw new BadRequest_1.BadRequest("Invalid message ID");
    }
    const message = await Message_1.MessageModel.findById(messageId);
    if (!message)
        throw new Errors_1.NotFound("Message not found");
    await message.deleteOne();
    return (0, response_1.SuccessResponse)(res, { message: "Message deleted successfully" });
};
exports.adminDeleteMessage = adminDeleteMessage;
// ✅ Admin Delete Room
const adminDeleteRoom = async (req, res) => {
    if (!req.admin || !req.admin.isSuperAdmin)
        throw new Errors_1.UnauthorizedError("super admin only");
    const { roomId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(roomId)) {
        throw new BadRequest_1.BadRequest("Invalid room ID");
    }
    const room = await Room_1.RoomModel.findById(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    await room.deleteOne();
    return (0, response_1.SuccessResponse)(res, { message: "Room deleted successfully" });
};
exports.adminDeleteRoom = adminDeleteRoom;
