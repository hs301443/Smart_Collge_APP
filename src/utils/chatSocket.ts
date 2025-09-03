import { Server } from "socket.io";
import { MessageModel } from "../models/shema/Message";
import { ConversationModel } from "../models/shema/Conversation";

interface UserSocket {
  userId: string;
  socketId: string;
  role: "Admin" | "User";
}

const connectedUsers: UserSocket[] = [];

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("register", (data: { userId: string; role: "Admin" | "User" }) => {
      connectedUsers.push({ ...data, socketId: socket.id });
      console.log("Registered user:", data.userId, "as", data.role);
    });

    socket.on(
      "sendMessage",
      async (data: { from: string; fromModel: "Admin" | "User"; to: string; toModel: "Admin" | "User"; text: string }) => {
        // البحث أو إنشاء المحادثة
        const conversation = await ConversationModel.findOneAndUpdate(
          {
            user: data.fromModel === "User" ? data.from : data.to,
            admin: data.fromModel === "Admin" ? data.from : data.to,
          },
          { lastMessageAt: new Date(), $inc: { [`unread.${data.toModel.toLowerCase()}`]: 1 } },
          { upsert: true, new: true }
        );

        // حفظ الرسالة
        const newMessage = new MessageModel({
          conversation: conversation._id,
          from: data.from,
          fromModel: data.fromModel,
          to: data.to,
          toModel: data.toModel,
          text: data.text,
        });
        await newMessage.save();

        // إرسال الرسالة real-time
        const receiver = connectedUsers.find((u) => u.userId === data.to && u.role === data.toModel);
        if (receiver) {
          io.to(receiver.socketId).emit("receiveMessage", data);
        }
      }
    );

    socket.on("disconnect", () => {
      const index = connectedUsers.findIndex((u) => u.socketId === socket.id);
      if (index !== -1) connectedUsers.splice(index, 1);
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
