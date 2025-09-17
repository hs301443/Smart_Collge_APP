import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { UserModel } from "../models/shema/auth/User";
import { AdminModel } from "../models/shema/auth/Admin";
import { RoomModel } from "../models/shema/Room";
import { MessageModel } from "../models/shema/Message";

interface AuthSocket extends Socket {
  userId?: string;
  username?: string;
  role?: "User" | "Admin";
}

export const setupChatSockets = (io: Server) => {
  io.use(async (socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      let user: any = null;

      if (decoded.role === "Admin") {
        user = await AdminModel.findById(decoded.id);
      } else {
        user = await UserModel.findById(decoded.id);
      }

      if (!user) return next(new Error("Authentication error"));

      socket.userId = user._id.toString();
      socket.username = user.name;
      socket.role = decoded.role;

      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: AuthSocket) => {
    console.log(`✅ ${socket.role} connected: ${socket.username}`);

    socket.on("join-room", async (roomId: string) => {
      const room = await RoomModel.findById(roomId);
      if (!room) return socket.emit("error", { message: "Room not found" });

      const userObjectId = new mongoose.Types.ObjectId(socket.userId);

      if (
        socket.role === "Admin" ||
        room.members.some((m) => m.equals(userObjectId))
      ) {
        socket.join(roomId);
        socket.emit("joined-room", { roomId });
      } else {
        socket.emit("error", { message: "Unauthorized" });
      }
    });

    socket.on("send-message", async (data: { roomId: string; content: string }) => {
      const { roomId, content } = data;
      const room = await RoomModel.findById(roomId);
      if (!room) return socket.emit("error", { message: "Room not found" });

      const message = await MessageModel.create({
        room: roomId,
        sender: { id: socket.userId, role: socket.role },
        content,
      });

      io.to(roomId).emit("new-message", {
        id: message._id,
        sender: socket.username,
        role: socket.role,
        content: message.content,
        timestamp: message.timestamp,
      });
    });

    socket.on("typing-start", (roomId: string) => {
      socket.to(roomId).emit("user-typing", {
        userId: socket.userId,
        username: socket.username,
        role: socket.role,
      });
    });

    socket.on("typing-stop", (roomId: string) => {
      socket.to(roomId).emit("user-stopped-typing", {
        userId: socket.userId,
        username: socket.username,
        role: socket.role,
      });
    });

    socket.on("disconnect", async () => {
      console.log(`❌ ${socket.role} disconnected: ${socket.username}`);
      let user: any = null;

      if (socket.role === "Admin") {
        user = await AdminModel.findById(socket.userId);
      } else {
        user = await UserModel.findById(socket.userId);
      }

      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();
      }

      socket.broadcast.emit("user-offline", {
        userId: socket.userId,
        role: socket.role,
      });
    });
  });
};
