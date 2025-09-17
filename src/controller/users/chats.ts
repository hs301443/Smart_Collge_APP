import { Request, Response } from "express";
import { RoomModel } from "../../models/shema/Room";
import { MessageModel } from "../../models/shema/Message";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import mongoose from "mongoose";

// Create room
export const createRoom = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");
   const userId = req.user.id;
    const { name, description, isPrivate } = req.body;

    const existingRoom = await RoomModel.findOne({ name });
    if (existingRoom) return res.status(400).json({ error: "Room already exists" });

    const room = new RoomModel({
      name,
      description,
      isPrivate,
      members: [userId],
      admins: [userId],
createdBy: { 
    id: userId, 
    role: req.user.role // "User" أو "Admin" حسب التوكن
  },    });

    await room.save();
    SuccessResponse(res, { message: "Room created successfully", room });
  } ;

// Get all rooms for user
export const getRooms = async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");

    const userId = req.user.id;

    const rooms = await RoomModel.find({
      $or: [{ members: userId }, { isPrivate: false }],
    }).sort({ updatedAt: -1 });

    SuccessResponse(res, { message: "Get all Room successfully", rooms });
  };

// Join room
export const joinRoom = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");
  
  const userId = req.user.id;
  const { roomId } = req.params;
  if (!roomId) throw new BadRequest("Room ID is required");

  const room = await RoomModel.findById(roomId);
  if (!room) throw new NotFound("Room not found");

  const userObjectId = new mongoose.Types.ObjectId(userId);

  if (!room.members.includes(userObjectId)) {
    room.members.push(userObjectId);
    await room.save();
  }

  SuccessResponse(res, { message: "Joined room successfully" });
};
// Get room messages
export const getRoomMessages = async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await MessageModel.find({ room: roomId })
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate("sender", "username avatar");

    SuccessResponse(res,{ messages: messages.reverse() });
  } ;
