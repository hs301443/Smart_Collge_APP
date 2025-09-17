"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoom = exports.getAllRooms = exports.createRoomByAdmin = void 0;
const Room_1 = require("../../models/shema/Room");
const Message_1 = require("../../models/shema/Message");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const Errors_2 = require("../../Errors");
const response_1 = require("../../utils/response");
// Create room (Admin only)
const createRoomByAdmin = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can perform this action");
    const { name, description, isPrivate } = req.body;
    if (!name || !description)
        throw new BadRequest_1.BadRequest("name is required and description is required");
    const adminId = req.user.id;
    const existingRoom = await Room_1.RoomModel.findOne({ name });
    if (existingRoom)
        throw new BadRequest_1.BadRequest("Room already exists");
    const room = new Room_1.RoomModel({
        name,
        description,
        isPrivate,
        createdBy: adminId,
        admins: [adminId],
    });
    await room.save();
    (0, response_1.SuccessResponse)(res, { message: "Room created successfully by admin", room });
};
exports.createRoomByAdmin = createRoomByAdmin;
// Get all rooms (Admin sees all)
const getAllRooms = async (_req, res) => {
    if (!_req.user || !_req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can perform this action");
    const rooms = await Room_1.RoomModel.find().sort({ updatedAt: -1 });
    res.json({ rooms });
};
exports.getAllRooms = getAllRooms;
// Delete a room
const deleteRoom = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can perform this action");
    const { roomId } = req.params;
    if (!roomId)
        throw new BadRequest_1.BadRequest("Room ID is required");
    const room = await Room_1.RoomModel.findByIdAndDelete(roomId);
    if (!room)
        throw new Errors_1.NotFound("Room not found");
    await Message_1.MessageModel.deleteMany({ room: roomId });
    res.json({ message: "Room and its messages deleted successfully" });
};
exports.deleteRoom = deleteRoom;
