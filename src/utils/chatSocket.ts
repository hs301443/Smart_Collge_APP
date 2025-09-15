import { Server } from "socket.io";
import { MessageModel } from "../models/shema/Message";
import { ConversationModel } from "../models/shema/Conversation";

interface UserSocket {
  userId: string;
  socketId: string;
  role: "Admin" | "User";
}

let io: Server; // نخزن الـ instance هنا
const connectedUsers: UserSocket[] = [];

// initSocket عشان تناديها من server.ts
export const setupSocket = (serverIo: Server) => {
  io = serverIo;

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("register", (data: { userId: string; role: "Admin" | "User" }) => {
      connectedUsers.push({ ...data, socketId: socket.id });
      socket.join(data.userId); // يدخل Room بنفس الـ userId
      console.log("Registered user:", data.userId, "as", data.role);
    });

    socket.on(
      "sendMessage",
      async (data: { from: string; fromModel: "Admin" | "User"; to: string; toModel: "Admin" | "User"; text: string }) => {
        const conversation = await ConversationModel.findOneAndUpdate(
          {
            user: data.fromModel === "User" ? data.from : data.to,
            admin: data.fromModel === "Admin" ? data.from : data.to,
          },
          { lastMessageAt: new Date(), $inc: { [`unread.${data.toModel.toLowerCase()}`]: 1 } },
          { upsert: true, new: true }
        );

        const newMessage = new MessageModel({
          conversation: conversation._id,
          from: data.from,
          fromModel: data.fromModel,
          to: data.to,
          toModel: data.toModel,
          text: data.text,
        });
        await newMessage.save();

        // ابعت الرسالة للـ Receiver
        io.to(data.to).emit("receiveMessage", newMessage);
      }
    );

    socket.on("disconnect", () => {
      const index = connectedUsers.findIndex((u) => u.socketId === socket.id);
      if (index !== -1) connectedUsers.splice(index, 1);
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

// Getter عشان تستعمل io في أي مكان
export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
