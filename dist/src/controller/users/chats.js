"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomMessages = exports.joinRoom = exports.getRooms = exports.createRoom = void 0;
const Room_1 = require("../../models/shema/Room");
const Message_1 = require("../../models/shema/Message");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const mongoose_1 = __importDefault(require("mongoose"));
// Create room
const createRoom = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const userId = req.user.id;
    const { name, description, isPrivate } = req.body;
    const existingRoom = await Room_1.RoomModel.findOne({ name });
    if (existingRoom)
        return res.status(400).json({ error: "Room already exists" });
    const room = new Room_1.RoomModel({
        name,
        description,
        isPrivate,
        members: [userId],
        admins: [userId],
        createdBy: {
            id: userId,
            role: req.user.role // "User" أو "Admin" حسب التوكن
        },
    });
    await room.save();
    (0, response_1.SuccessResponse)(res, { message: "Room created successfully", room });
};
exports.createRoom = createRoom;
// Get all rooms for user
const getRooms = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const userId = req.user.id;
    const rooms = await Room_1.RoomModel.find({
        $or: [{ members: userId }, { isPrivate: false }],
    }).sort({ updatedAt: -1 });
    (0, response_1.SuccessResponse)(res, { message: "Get all Room successfully", rooms });
};
exports.getRooms = getRooms;
// Join room
const joinRoom = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const userId = req.user.id;
    const { roomId } = req.params;
    if (!roomId)
        throw new BadRequest_1.BadRequest("Room ID is required");
    const room = await Room_1.RoomModel.findById(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
    if (!room.members.includes(userObjectId)) {
        room.members.push(userObjectId);
        await room.save();
    }
    (0, response_1.SuccessResponse)(res, { message: "Joined room successfully" });
};
exports.joinRoom = joinRoom;
// Get room messages
const getRoomMessages = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message_1.MessageModel.find({ room: roomId })
        .sort({ timestamp: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .populate("sender", "username avatar");
    (0, response_1.SuccessResponse)(res, { messages: messages.reverse() });
};
exports.getRoomMessages = getRoomMessages;
