"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.setupSocket = void 0;
const Message_1 = require("../models/shema/Message");
const Conversation_1 = require("../models/shema/Conversation");
let io; // نخزن الـ instance هنا
const connectedUsers = [];
// initSocket عشان تناديها من server.ts
const setupSocket = (serverIo) => {
    io = serverIo;
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);
        socket.on("register", (data) => {
            connectedUsers.push({ ...data, socketId: socket.id });
            socket.join(data.userId); // يدخل Room بنفس الـ userId
            console.log("Registered user:", data.userId, "as", data.role);
        });
        socket.on("sendMessage", async (data) => {
            const conversation = await Conversation_1.ConversationModel.findOneAndUpdate({
                user: data.fromModel === "User" ? data.from : data.to,
                admin: data.fromModel === "Admin" ? data.from : data.to,
            }, { lastMessageAt: new Date(), $inc: { [`unread.${data.toModel.toLowerCase()}`]: 1 } }, { upsert: true, new: true });
            const newMessage = new Message_1.MessageModel({
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
        });
        socket.on("disconnect", () => {
            const index = connectedUsers.findIndex((u) => u.socketId === socket.id);
            if (index !== -1)
                connectedUsers.splice(index, 1);
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
exports.setupSocket = setupSocket;
// Getter عشان تستعمل io في أي مكان
const getIO = () => {
    if (!io)
        throw new Error("Socket.io not initialized!");
    return io;
};
exports.getIO = getIO;
