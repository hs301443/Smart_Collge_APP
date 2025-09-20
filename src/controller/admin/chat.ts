import { Request, Response } from "express";
import { io } from "../../server";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { RoomModel } from "../../models/shema/Room";
import { MessageModel } from "../../models/shema/Message";
import { ObjectId, Types } from "mongoose";

// =========================
// Get All Rooms for Admin
// =========================
export const getAdminRooms = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin._id) throw new UnauthorizedError("Admin not found");

  const rooms = await RoomModel.find({ "participants.user": req.admin._id });
  SuccessResponse(res, { rooms });
};

// =========================
// Create Group
// =========================
export const createGroup = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin._id) throw new UnauthorizedError("Admin not found");
  const adminId = req.admin._id.toString();

  const { name, memberIds } = req.body;
  if (!name || !memberIds) throw new BadRequest("Missing required fields");

  const participants: { user: Types.ObjectId; role: "User" | "Admin" }[] = memberIds.map(
    (id: string) => ({ user: new Types.ObjectId(id), role: "User" })
  );
  participants.push({ user: new Types.ObjectId(adminId), role: "Admin" });

  const group = await RoomModel.create({
    type: "group",
    name,
    participants,
    createdBy: { user: req.admin._id, role: "Admin" },
  });

  participants.forEach((p) => {
    io.to(p.user.toString()).emit("new-group-notification", { roomId: group._id, name: group.name });
  });

  io.to(group._id.toString()).emit("group-updated", group);

  SuccessResponse(res, { group });
};

// =========================
// Add Member to Group
// =========================
export const addToGroup = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin._id) throw new UnauthorizedError("Admin not found");

  const { roomId, userId, role } = req.body;
  if (!roomId || !userId || !role) throw new BadRequest("Missing required fields");

  const room = await RoomModel.findById(roomId);
  if (!room) throw new NotFound("Room not found");

  if (room.participants.some((p: any) => p.user.toString() === userId.toString())) {
    throw new BadRequest("User already in group");
  }

  room.participants.push({ user: new Types.ObjectId(userId), role });
  await room.save();

  io.to(room._id.toString()).emit("group-updated", room);
  io.to(userId.toString()).emit("added-to-group", { roomId: room._id.toString(), name: room.name });

  SuccessResponse(res, { message: "User added to group", room });
};

// =========================
// Remove Member from Group
// =========================
export const removeFromGroup = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin._id) throw new UnauthorizedError("Admin not found");

  const { roomId, userId } = req.body;
  if (!roomId || !userId) throw new BadRequest("Missing required fields");

  const room = await RoomModel.findById(roomId);
  if (!room) throw new NotFound("Room not found");

  // ✅ استخدم set لتفادي مشكلة DocumentArray
  room.set(
    "participants",
    room.participants.filter(
      (p: any) => p.user.toString() !== userId.toString()
    )
  );

  await room.save();

  io.to(room._id.toString()).emit("group-updated", room);
  io.to(userId.toString()).emit("removed-from-group", { roomId: room._id.toString() });

  SuccessResponse(res, { message: "User removed from group", room });
};

// =========================
// Get Messages in a Room
// =========================
export const getRoomMessages = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin._id) throw new UnauthorizedError("Admin not found");

  const { roomId } = req.params;
  if (!roomId) throw new BadRequest("Missing required fields");

  const messages = await MessageModel.find({ room: roomId });
  if (!messages) throw new NotFound("Messages not found");

  SuccessResponse(res, { messages });
};

// =========================
// Send Message as Admin
// =========================
export const sendMessageAdmin = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin.id) throw new UnauthorizedError("Admin not found");

  const { roomId, content, attachment } = req.body;
  if (!roomId) throw new BadRequest("roomId is required");

  const room = await RoomModel.findById(roomId);
  if (!room) throw new NotFound("Room not found");

  const adminId = req.admin.id;
  const admin = req.admin;

  const message = await MessageModel.create({
    room: room._id,
    sender: { user: adminId.toString(), role: "Admin" },
    content: content || null,
    attachment: attachment || null,
    deliveredTo: room.participants.map((p: any) => p.user.toString()),
  });

  io.to(room._id.toString()).emit("new-message", {
    id: message._id,
    sender: admin.name,
    role: "Admin",
    content: message.content,
    attachment: message.attachment,
    timestamp: message.createdAt,
  });

message.deliveredTo
  .filter((uid: Types.ObjectId) => uid.toString() !== adminId.toString())
  .forEach((uid: Types.ObjectId) => {
    io.to(uid.toString()).emit("new-message-notification", {
      roomId: room._id.toString(),
      messageId: message._id,
      sender: admin.name,
    });
  });

  SuccessResponse(res, { message: "Message sent successfully", messageData: message });
};

// =========================
// Delete a Message (Soft Delete)
// =========================
export const deleteMessage = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin._id) throw new UnauthorizedError("Admin not found");

  const { messageId } = req.params;
  if (!messageId) throw new BadRequest("Missing required fields");

  const message = await MessageModel.findById(messageId);
  if (!message) throw new NotFound("Message not found");

  message.isDeleted = true;
  await message.save();

  if (message.room) {
    io.to(message.room.toString()).emit("message-deleted", { messageId });
  }

  SuccessResponse(res, { message: "Message deleted successfully" });
};

// =========================
// Delete All Messages in a Room
// =========================
export const deleteRoomMessages = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin._id) throw new UnauthorizedError("Admin not found");

  const { roomId } = req.params;
  if (!roomId) throw new BadRequest("Missing required fields");

  await MessageModel.updateMany({ room: roomId }, { $set: { isDeleted: true } });

  io.to(roomId.toString()).emit("all-messages-deleted", { roomId });

  SuccessResponse(res, { message: "All messages in room deleted" });
};
