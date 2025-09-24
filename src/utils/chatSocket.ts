// src/chatSocket.ts
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/shema/auth/User";
import { AdminModel } from "../models/shema/auth/Admin";
import { ChatModel } from "../models/shema/chat";
import { MessageModel } from "../models/shema/Message";

const onlineMap = new Map<string, Set<string>>(); // userType:userId -> sockets

export function initChatSocket(io: Server) {
  // ✅ مصادقة قبل الاتصال
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const payload: any = jwt.verify(token, process.env.JWT_SECRET || "changeme");

      let user: any = null;
      if (payload.type === "user") {
        user = await UserModel.findById(payload.id);
      } else if (payload.type === "admin") {
        user = await AdminModel.findById(payload.id);
      }

      if (!user) return next(new Error("Invalid user"));

      (socket as any).user = user;
      (socket as any).userType = payload.type;

      next();
    } catch (err) {
      next(err as any);
    }
  });

  // ✅ عند الاتصال
  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    const userType = (socket as any).userType;
    const key = `${userType}:${user._id}`;

    // سجل الأونلاين
    const set = onlineMap.get(key) ?? new Set();
    set.add(socket.id);
    onlineMap.set(key, set);

    if (userType === "user") {
      UserModel.findByIdAndUpdate(user._id, { isOnline: true }).exec();
    } else {
      AdminModel.findByIdAndUpdate(user._id, { isOnline: true }).exec();
    }

    console.log(`✅ ${userType} connected: ${user._id}`);

    // 🎯 join_chat
    socket.on("join_chat", async ({ chatId }) => {
      const chat = await ChatModel.findById(chatId);
      if (!chat) return socket.emit("error", "Chat not found");

      socket.join(`chat_${chatId}`);

      const messages = await MessageModel.find({ chat: chatId }).sort({ createdAt: 1 });
      socket.emit("chat_history", messages);
    });

    // 🎯 send_message
    socket.on("send_message", async ({ chatId, content }) => {
      if (!chatId || !content) return;

      const msg = await MessageModel.create({
        chat: chatId,
        senderModel: userType === "user" ? "User" : "Admin",
        sender: user._id,
        content,
        readBy: [user._id],
      });

      io.to(`chat_${chatId}`).emit("message", msg);
    });

    // 🎯 typing indicator
    socket.on("typing", ({ chatId, isTyping }) => {
      socket.to(`chat_${chatId}`).emit("typing", { chatId, userId: user._id, isTyping });
    });

    // 🎯 disconnect
    socket.on("disconnect", () => {
      const set = onlineMap.get(key);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          onlineMap.delete(key);

          if (userType === "user") {
            UserModel.findByIdAndUpdate(user._id, {
              isOnline: false,
              lastSeen: new Date(),
            }).exec();
          } else {
            AdminModel.findByIdAndUpdate(user._id, {
              isOnline: false,
              lastSeen: new Date(),
            }).exec();
          }
        }
      }
      console.log(`❌ ${userType} disconnected: ${user._id}`);
    });
  });
}
