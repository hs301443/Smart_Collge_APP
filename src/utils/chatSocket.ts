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
    socket.on("join_chat", async ({ chatId, adminId }) => {
      try {
        let chat;
        if (chatId) {
          chat = await ChatModel.findById(chatId);
          if (!chat) return socket.emit("error", "Chat not found");
        } else {
          if (!adminId) return socket.emit("error", "Admin ID required");
          chat = await ChatModel.findOne({ user: user._id, admin: adminId });
          if (!chat) chat = await ChatModel.create({ user: user._id, admin: adminId });
          chatId = chat._id;
        }

        socket.join(`chat_${chatId}`);

        const messages = await MessageModel.find({ chat: chatId }).sort({ createdAt: 1 });
        socket.emit("chat_history", messages);
      } catch (err) {
        console.error(err);
        socket.emit("error", "Join chat failed");
      }
    });

    // 🎯 send_message
    socket.on("send_message", async ({ chatId, adminId, content }) => {
      try {
        if (!content) return;

        let chat;
        if (chatId) {
          chat = await ChatModel.findById(chatId);
          if (!chat) return socket.emit("error", "Chat not found");
        } else {
          if (!adminId) return socket.emit("error", "Admin ID required for new chat");
          chat = await ChatModel.findOne({ user: user._id, admin: adminId });
          if (!chat) chat = await ChatModel.create({ user: user._id, admin: adminId });
          chatId = chat._id;
        }

        const msg = await MessageModel.create({
          chat: chatId,
          senderModel: userType === "user" ? "User" : "Admin",
          sender: user._id,
          content,
          readBy: [user._id],
        });

        // إرسال الرسالة لكل المتصلين بالشات
        io.to(`chat_${chatId}`).emit("message", msg);

        // إشعار للطرف الآخر
        io.to(`chat_${chatId}`).emit("notification", {
          chatId,
          sender: user._id,
          content,
        });
      } catch (err) {
        console.error(err);
        socket.emit("error", "Send message failed");
      }
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
