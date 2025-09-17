import { Request, Response } from "express";
import { RoomModel } from "../../models/shema/Room";
import { MessageModel } from "../../models/shema/Message";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

// Create room (Admin only)
export const createRoomByAdmin = async (req: Request, res: Response) => {
     if (!req.user || !req.user.isSuperAdmin)
    throw new UnauthorizedError("Only Super Admin can perform this action");
    const { name, description, isPrivate } = req.body;
    if (!name || !description) throw new BadRequest("name is required and description is required");
    const adminId = req.user.id;

    const existingRoom = await RoomModel.findOne({ name });
    if(existingRoom) throw new BadRequest("Room already exists");
    const room = new RoomModel({
      name,
      description,
      isPrivate,
      createdBy: adminId,
      admins: [adminId],
    });

    await room.save();
    SuccessResponse(res,{ message: "Room created successfully by admin", room });
  };

// Get all rooms (Admin sees all)
export const getAllRooms = async (_req: Request, res: Response) => {
  if (!_req.user || !_req.user.isSuperAdmin)
    throw new UnauthorizedError("Only Super Admin can perform this action");
    const rooms = await RoomModel.find().sort({ updatedAt: -1 });
    res.json({ rooms });
  
};

// Delete a room
export const deleteRoom = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin)
    throw new UnauthorizedError("Only Super Admin can perform this action");
    const { roomId } = req.params;
    if(!roomId) throw new BadRequest("Room ID is required");
    const room = await RoomModel.findByIdAndDelete(roomId);

    if (!room) throw new NotFound("Room not found");

    await MessageModel.deleteMany({ room: roomId });

    res.json({ message: "Room and its messages deleted successfully" });
  
};
