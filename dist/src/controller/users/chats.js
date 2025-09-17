"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.sendMessage = exports.joinRoom = exports.createRoom = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Room_1 = require("../../models/shema/Room");
const Message_1 = require("../../models/shema/Message");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
// ✅ Create Room
const createRoom = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { name, description, isPrivate } = req.body;
    if (!name)
        throw new BadRequest_1.BadRequest("Room name is required");
    const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
    const room = await Room_1.RoomModel.create({
        name,
        description,
        isPrivate,
        createdBy: {
            id: userId,
            role: "User",
        },
        members: [userId],
    });
    (0, response_1.SuccessResponse)(res, { message: "Room created successfully", room });
};
exports.createRoom = createRoom;
// ✅ Join Room
const joinRoom = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { roomId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(roomId)) {
        throw new BadRequest_1.BadRequest("Invalid room ID");
    }
    const room = await Room_1.RoomModel.findById(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
    if (room.members.some((m) => m.equals(userId))) {
        throw new BadRequest_1.BadRequest("Already a member of this room");
    }
    room.members.push(userId);
    await room.save();
    return (0, response_1.SuccessResponse)(res, { message: "Joined room successfully", room });
};
exports.joinRoom = joinRoom;
// ✅ Send Message
const sendMessage = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { roomId } = req.params;
    const { text } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(roomId)) {
        throw new BadRequest_1.BadRequest("Invalid room ID");
    }
    const room = await Room_1.RoomModel.findById(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
    if (!room.members.some((m) => m.equals(userId))) {
        throw new Errors_1.UnauthorizedError("You are not a member of this room");
    }
    const messages = await Message_1.MessageModel.create({
        room: roomId,
        sender: userId,
        text,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Message sent successfully", messages });
};
exports.sendMessage = sendMessage;
// ✅ Get Room Messages
const getMessages = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
    const { roomId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(roomId)) {
        throw new BadRequest_1.BadRequest("Invalid room ID");
    }
    const room = await Room_1.RoomModel.findById(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    if (!room.members.some((m) => m.equals(userId))) {
        throw new Errors_1.UnauthorizedError("You are not a member of this room");
    }
    const messages = await Message_1.MessageModel.find({ room: roomId })
        .populate("sender", "name email")
        .sort({ createdAt: 1 });
    (0, response_1.SuccessResponse)(res, {
        message: "Messages fetched successfully",
        messages,
    });
};
exports.getMessages = getMessages;
