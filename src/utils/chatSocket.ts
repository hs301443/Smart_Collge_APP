import { Server } from "socket.io";
import { MessageModel } from "../models/shema/Message";
import { ConversationModel } from "../models/shema/Conversation";

interface UserSocket {
  userId: string;
  socketId: string;
  role: "Admin" | "User";
}

let io: Server;
const connectedUsers: UserSocket[] = [];

export const setupSocket = (serverIo: Server) => {
  io = serverIo;

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // تسجيل يوزر
    socket.on("register", (data: { userId: string; role: "Admin" | "User" }) => {
      console.log("➡️ Register event received:", data);

      connectedUsers.push({ ...data, socketId: socket.id });
      socket.join(data.userId);
      console.log(`✅ Registered user ${data.userId} as ${data.role}`);
    });

    // إرسال رسالة
    socket.on("sendMessage", async (data: { 
      from: string; 
      fromModel: "Admin" | "User"; 
      to: string; 
      toModel: "Admin" | "User"; 
      text: string 
    }) => {
      console.log("➡️ sendMessage event received:", data);

      try {
        const conversation = await ConversationModel.findOneAndUpdate(
          {
            user: data.fromModel === "User" ? data.from : data.to,
            admin: data.fromModel === "Admin" ? data.from : data.to,
          },
          { 
            lastMessageAt: new Date(), 
            $inc: { [`unread.${data.toModel.toLowerCase()}`]: 1 } 
          },
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
        console.log("✅ Message saved:", newMessage);

        io.to(data.to).emit("receiveMessage", newMessage);
        console.log(`📤 Message sent to user ${data.to}`);
      } catch (err) {
        console.error("❌ Error in sendMessage:", err);
        socket.emit("errorMessage", { error: "Failed to send message" });
      }
    });

    // فصل يوزر
    socket.on("disconnect", () => {
      const index = connectedUsers.findIndex((u) => u.socketId === socket.id);
      if (index !== -1) connectedUsers.splice(index, 1);

      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
