import { Request, Response } from "express";
import mongoose from "mongoose";
import { RoomModel } from "../../models/shema/Room";
import { MessageModel } from "../../models/shema/Message";
import { NotFound, UnauthorizedError } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";

// ✅ Create Room
export const createRoom = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");
  const { name, description, isPrivate } = req.body;

  if (!name) throw new BadRequest("Room name is required");

  const userId = new mongoose.Types.ObjectId(req.user.id);

  const room = await RoomModel.create({
    name,
    description,
    isPrivate,
    createdBy: {
      id: userId,
      role: "User",
    },
    members: [userId],
  });

  SuccessResponse(res, { message: "Room created successfully", room });
};

// ✅ Join Room
export const joinRoom = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");
  const { roomId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new BadRequest("Invalid room ID");
  }

  const room = await RoomModel.findById(roomId);
  if (!room) throw new NotFound("Room not found");

  const userId = new mongoose.Types.ObjectId(req.user.id);

  if (room.members.some((m) => m.equals(userId))) {
    throw new BadRequest("Already a member of this room");
  }

  room.members.push(userId);
  await room.save();

  return SuccessResponse(res, { message: "Joined room successfully", room });
};

// ✅ Send Message
export const sendMessage = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");
  const { roomId } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new BadRequest("Invalid room ID");
  }

  const room = await RoomModel.findById(roomId);
  if (!room) throw new NotFound("Room not found");

  const userId = new mongoose.Types.ObjectId(req.user.id);

  if (!room.members.some((m) => m.equals(userId))) {
    throw new UnauthorizedError("You are not a member of this room");
  }

  const messages = await MessageModel.create({
    room: roomId,
    sender: userId,
    text,
  });

  return SuccessResponse(res, { message: "Message sent successfully", messages });
};

// ✅ Get Room Messages
export const getMessages = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const { roomId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(roomId)) {
    throw new BadRequest("Invalid room ID");
  }

  const room = await RoomModel.findById(roomId);
  if (!room) throw new NotFound("Room not found");

  if (!room.members.some((m) => m.equals(userId))) {
    throw new UnauthorizedError("You are not a member of this room");
  }

  const messages = await MessageModel.find({ room: roomId })
    .populate("sender", "name email")
    .sort({ createdAt: 1 });

  SuccessResponse(res, {
    message: "Messages fetched successfully",
    messages,
  });
};
