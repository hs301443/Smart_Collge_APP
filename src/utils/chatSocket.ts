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

      if (decoded.role === "Admin") user = await AdminModel.findById(decoded.id);
      else user = await UserModel.findById(decoded.id);

      if (!user) return next(new Error("Authentication error"));

      socket.userId = user._id.toString();
      socket.username = user.name;
      socket.role = decoded.role;

      user.isOnline = true;
      user.lastSeen = new Date();
      await user.save();

      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: AuthSocket) => {
    console.log(`✅ ${socket.role} connected: ${socket.username}`);

    socket.on("join-room", async (roomId: string) => {
      const room = await RoomModel.findById(roomId);
      if (!room) return socket.emit("error", { message: "Room not found" });

      const isParticipant = room.participants.some(
        (p: { user: mongoose.mongo.ObjectId }) => p.user.toString() === socket.userId
      );
      if (!isParticipant) return socket.emit("error", { message: "Unauthorized" });

      socket.join(roomId);

      const messages = await MessageModel.find({ room: roomId, isDeleted: { $ne: true } });
      socket.emit("room-messages", messages);
      socket.emit("joined-room", { roomId });
    });

    socket.on(
      "send-message",
      async (data: { roomId: string; content?: string; attachment?: { type: string; url: string } }) => {
        const { roomId, content, attachment } = data;
        let room = null;

        if (roomId) {
          room = await RoomModel.findById(roomId);
          if (!room) return socket.emit("error", { message: "Room not found" });
        }

        const message = await MessageModel.create({
          room: room?._id || null,
          sender: { user: new mongoose.mongo.ObjectId(socket.userId!), role: socket.role },
          content: content || null,
          attachment: attachment || null,
          deliveredTo: room
            ? room.participants.map((p: { user: mongoose.mongo.ObjectId }) => p.user.toString())
            : [data.roomId],
        });

        if (room) io.to(room._id.toString()).emit("new-message", message);
        else io.to(data.roomId).emit("new-message", message);

        message.deliveredTo
          .filter((uid: string) => uid !== socket.userId)
          .forEach((uid: string) => {
            io.to(uid).emit("new-message-notification", {
              roomId: room?._id || data.roomId,
              messageId: message._id,
              sender: socket.username,
            });
          });
      }
    );

    socket.on("seen-message", async ({ roomId, messageId }) => {
      const message = await MessageModel.findById(messageId);
      if (!message || !socket.userId) return;

      if (!message.seenBy.some((u: mongoose.mongo.ObjectId | string) => u.toString() === socket.userId)) {
        message.seenBy.push(new mongoose.mongo.ObjectId(socket.userId));
        await message.save();
        io.to(roomId).emit("message-seen", { messageId, userId: socket.userId });
      }
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

    socket.on("create-group", async (data: { name: string; memberIds: string[] }) => {
      if (socket.role !== "Admin") return;

      const participants = data.memberIds.map((id) => ({ user: new mongoose.mongo.ObjectId(id), role: "User" }));
      participants.push({ user: new mongoose.mongo.ObjectId(socket.userId!), role: "Admin" });

      const group = await RoomModel.create({
        type: "group",
        name: data.name,
        participants,
        createdBy: { user: new mongoose.mongo.ObjectId(socket.userId!), role: "Admin" },
      });

      socket.join(group._id.toString());

      participants.forEach((p) =>
        io.to(p.user.toString()).emit("new-group-notification", { roomId: group._id, name: group.name })
      );
      io.to(group._id.toString()).emit("group-updated", group);
    });

    socket.on(
      "add-to-group",
      async (data: { roomId: string; userId: string; role: "User" | "Admin" }) => {
        if (socket.role !== "Admin") return;
        const room = await RoomModel.findById(data.roomId);
        if (!room) return socket.emit("error", { message: "Room not found" });

        if (!room.participants.some((p: { user: mongoose.mongo.ObjectId }) => p.user.toString() === data.userId)) {
          room.participants.push({ user: new mongoose.mongo.ObjectId(data.userId), role: data.role });
          await room.save();
        }

        io.to(room._id.toString()).emit("group-updated", room);
        io.to(data.userId).emit("added-to-group", { roomId: room._id, name: room.name });
      }
    );

    socket.on("remove-from-group", async (data: { roomId: string; userId: string }) => {
      if (socket.role !== "Admin") return;
      const room = await RoomModel.findById(data.roomId);
      if (!room) return socket.emit("error", { message: "Room not found" });

      room.participants = room.participants.filter(
        (p: { user: mongoose.mongo.ObjectId }) => p.user.toString() !== data.userId
      );
      await room.save();

      io.to(room._id.toString()).emit("group-updated", room);
      io.to(data.userId).emit("removed-from-group", { roomId: room._id });
    });

    socket.on("disconnect", async () => {
      if (!socket.userId) return;
      let user: any = null;

      if (socket.role === "Admin") user = await AdminModel.findById(socket.userId);
      else user = await UserModel.findById(socket.userId);

      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();
      }

      socket.broadcast.emit("user-offline", { userId: socket.userId, role: socket.role });
    });
  });
};
