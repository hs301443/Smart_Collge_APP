import { Request, Response } from "express";
import mongoose from "mongoose";
import { RoomModel } from "../../models/shema/Room";
import { MessageModel } from "../../models/shema/Message";
import { NotFound, UnauthorizedError } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";

// ✅ Admin Create Room
export const adminCreateRoom = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin.isSuperAdmin) throw new UnauthorizedError("super admin only");

  const { name, description, isPrivate } = req.body;

  if (!name) throw new BadRequest("Room name is required");

  const room = await RoomModel.create({
    name,
    description,
    isPrivate,
    createdBy: {
      id: req.admin._id,
      role: "Admin",
    },
    admins: [req.admin._id],
  });

  SuccessResponse(res, { message: "Room created successfully", room });
};

// ✅ Admin Join Room (force join if needed)
export const adminJoinRoom = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin.isSuperAdmin) {
    throw new UnauthorizedError("super admin only");
  }

  if (!req.admin._id) {
    throw new UnauthorizedError("Invalid admin ID");
  }

  const { roomId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new BadRequest("Invalid room ID");
  }

  const room = await RoomModel.findById(roomId);
  if (!room) throw new NotFound("Room not found");

  const adminId = req.admin._id as mongoose.Types.ObjectId;

  if (room.admins.includes(adminId)) {
    throw new BadRequest("Already an admin in this room");
  }

  room.admins.push(adminId);
  await room.save();

  return SuccessResponse(res, { message: "Joined room successfully", room });
};


// ✅ Admin Send Message
export const adminSendMessage = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin.isSuperAdmin) throw new UnauthorizedError("super admin only");

  const { roomId } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new BadRequest("Invalid room ID");
  }

  const room = await RoomModel.findById(roomId);
  if (!room) throw new NotFound("Room not found");

  const messages = await MessageModel.create({
    room: roomId,
    sender: req.admin._id,
    text,
  });

  return SuccessResponse(res, { message: "Message sent successfully", messages });
};

// ✅ Admin Delete Message
export const adminDeleteMessage = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin.isSuperAdmin) throw new UnauthorizedError("super admin only");

  const { messageId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new BadRequest("Invalid message ID");
  }

  const message = await MessageModel.findById(messageId);
  if (!message) throw new NotFound("Message not found");

  await message.deleteOne();
  return SuccessResponse(res, { message: "Message deleted successfully" });
};

// ✅ Admin Delete Room
export const adminDeleteRoom = async (req: Request, res: Response) => {
  if (!req.admin || !req.admin.isSuperAdmin) throw new UnauthorizedError("super admin only");

  const { roomId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new BadRequest("Invalid room ID");
  }

  const room = await RoomModel.findById(roomId);
  if (!room) throw new NotFound("Room not found");

  await room.deleteOne();
  return SuccessResponse(res, { message: "Room deleted successfully" });
};
