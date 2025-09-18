import { Request, Response } from "express";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { RoomModel } from "../../models/shema/Room";
import { MessageModel } from "../../models/shema/Message";

// socket.io instance لازم يبقى مستورد هنا
import { io } from "../../server"; // افترض إنك مهيأ io في server.ts

// ✅ جلب كل الرومات الخاصة بالـ User
export const getUserRooms = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const rooms = await RoomModel.find({
    "participants.user": req.user.id,
    isDeleted: { $ne: true },
  }).sort({ updatedAt: -1 });

  SuccessResponse(res, { rooms });
};

// ✅ إنشاء روم جديد مع User أو Admin
export const createRoom = async (req: Request, res: Response) => {
  const { participants, type, name } = req.body;
  if (!req.user) throw new UnauthorizedError("User not found");

  if (!participants || participants.length === 0) throw new BadRequest("Participants are required");

  const room = await RoomModel.create({
    type: type || "direct",
    name: name || null,
    participants: [
      { user: req.user.id, role: "User" },
      ...participants,
    ],
    createdBy: { user: req.user.id, role: "User" },
  });

  // ريل تايم: إخطار كل المشاركين بالروم الجديد
  room.participants.forEach((p) => {
    io.to(p.user.toString()).emit("new-room", { room });
  });

  SuccessResponse(res, { message: "Room created successfully", room });
};

// ✅ جلب كل الرسائل في روم معين
export const getRoomMessages = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("User not found");

  const { roomId } = req.params;

  const messages = await MessageModel.find({
    room: roomId,
    isDeleted: { $ne: true },
  }).sort({ createdAt: 1 });

  SuccessResponse(res, { messages });
};

// ✅ إرسال رسالة في روم
export const sendMessage = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("User not found");

  const { roomId, content, attachment } = req.body;
  const room = await RoomModel.findById(roomId);
  if (!room) throw new NotFound("Room not found");

  const messages= await MessageModel.create({
    room: roomId,
    sender: { user: req.user.id, role: "User" },
    content: content || null,
    attachment: attachment || null,
    deliveredTo: room.participants.map((p) => p.user),
  });

  // ريل تايم: إرسال الرسالة لكل المشاركين في الغرفة
  io.to(roomId).emit("new-message", {
    id: messages._id,
    sender: req.user.name,
    role: "User",
    content: messages.content,
    attachment: messages.attachment,
    timestamp: messages.createdAt,
  });

  SuccessResponse(res, { message: "Message sent successfully", messages });
};

// ✅ حذف رسالة (soft delete)
export const deleteMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  if (!req.user) throw new UnauthorizedError("User not found");

  const message = await MessageModel.findById(messageId);
  if (!message) throw new NotFound("Message not found");

  if (!message.sender || message.sender.user.toString() !== req.user.id) {
    throw new UnauthorizedError("Unauthorized");
  }

  message.isDeleted = true;
  await message.save();

  // إخطار المشاركين بالحذف
  if (message.room) {
    io.to(message.room.toString()).emit("message-deleted", { messageId });
  }

  SuccessResponse(res, { message: "Message deleted successfully" });
};

// ✅ حذف روم (soft delete)
export const deleteRoom = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  if (!req.user) throw new UnauthorizedError("User not found");
  const userId=req.user.id
  const room = await RoomModel.findById(roomId);
  if (!room) throw new NotFound("Room not found");

  const participant = room.participants.find((p) => p.user.toString() === userId);
  if (!participant) throw new UnauthorizedError("Unauthorized");

  room.isDeleted = true;
  await room.save();

  // إخطار المشاركين بحذف الروم
  room.participants.forEach((p) => {
    io.to(p.user.toString()).emit("room-deleted", { roomId });
  });

  SuccessResponse(res, { message: "Room deleted successfully" });
};
