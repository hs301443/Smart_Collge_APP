// src/chatSocket.ts
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/shema/auth/User";
import { AdminModel } from "../models/shema/auth/Admin";
import { ChatModel } from "../models/shema/chat";
import { MessageModel } from "../models/shema/Message";
import { messaging } from "./firebase";

const onlineMap = new Map<string, Set<string>>(); // userType:userId -> sockets

export function initChatSocket(io: Server) {
  // ✅ مصادقة قبل الاتصال
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const payload: any = jwt.verify(token, process.env.JWT_SECRET || "changeme");

      let user: any = null;
      let userType: "user" | "admin" | null = null;

      if (payload.userType === "Student" || payload.userType === "Graduated") {
        user = await UserModel.findById(payload.id);
        userType = "user";
      } else if (payload.userType === "Admin" || payload.userType === "SuperAdmin") {
        user = await AdminModel.findById(payload.id);
        userType = "admin";
      }

      if (!user) return next(new Error("Invalid user"));

      (socket as any).user = user;
      (socket as any).userType = userType;

      next();
    } catch (err) {
      next(err as any);
    }
  });

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

    // 🎯 join chat
    socket.on("join_chat", async () => {
      try {
        let chat;

        if (userType === "user") {
          const admin = await AdminModel.findOne();
          if (!admin) return socket.emit("error", "No admin found");

          chat =
            (await ChatModel.findOne({ user: user._id, admin: admin._id })) ||
            (await ChatModel.create({ user: user._id, admin: admin._id }));

          socket.join(`chat_${chat._id}`);

          const messages = await MessageModel.find({ chat: chat._id })
            .sort({ createdAt: 1 })
            .populate("sender");

          socket.emit("chat_history", { chatId: chat._id, messages });
        } else {
          socket.emit("error", "Admin must specify chatId explicitly");
        }
      } catch (err) {
        console.error(err);
        socket.emit("error", "Join chat failed");
      }
    });

    // 🎯 send_message
    socket.on("send_message", async ({ content, chatId }) => {
      try {
        if (!content) return;

        let chat;

        if (userType === "user") {
          const admin = await AdminModel.findOne();
          if (!admin) return socket.emit("error", "No admin found");

          chat =
            (await ChatModel.findOne({ user: user._id, admin: admin._id })) ||
            (await ChatModel.create({ user: user._id, admin: admin._id }));
        } else {
          if (!chatId) return socket.emit("error", "chatId is required for admin");
          chat = await ChatModel.findById(chatId);
        }

        if (!chat) return socket.emit("error", "Chat not found");

        const msg = await MessageModel.create({
          chat: chat._id,
          senderModel: userType === "user" ? "User" : "Admin",
          sender: user._id,
          content,
          readBy: [user._id],
        });

        const populatedMsg = await msg.populate("sender");

        // ✅ حل مشكلة 'chat' is possibly 'null'
        io.to(`chat_${chat!._id}`).emit("message", populatedMsg);

        // 🔔 FCM Notification باسم المرسل
        let targetToken: string | null = null;
        if (userType === "user") {
          const admin = await AdminModel.findOne();
          targetToken = admin?.fcmtoken || null;
        } else {
          const userModel = await UserModel.findById(chat.user);
          targetToken = userModel?.fcmtoken || null;
        }

        if (targetToken) {
          const sender = populatedMsg.sender as any;
          const senderName = sender?.name || (userType === "user" ? "User" : "Admin");

          await messaging.send({
            token: targetToken,
            notification: {
              title: senderName,
              body: populatedMsg.content,
            },
            data: {
              chatId: chat._id.toString(),
              sender: userType,
            },
          });
        }
      } catch (err) {
        console.error(err);
        socket.emit("error", "Send message failed");
      }
    });

    // 🎯 typing
    socket.on("typing", async ({ chatId, isTyping }) => {
      if (!chatId) return;
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
            UserModel.findByIdAndUpdate(user._id, { isOnline: false, lastSeen: new Date() }).exec();
          } else {
            AdminModel.findByIdAndUpdate(user._id, { isOnline: false, lastSeen: new Date() }).exec();
          }
        }
      }
      console.log(`❌ ${userType} disconnected: ${user._id}`);
    });
  });
}
