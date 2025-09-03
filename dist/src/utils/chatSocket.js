"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const Message_1 = require("../models/shema/Message");
const Conversation_1 = require("../models/shema/Conversation");
const connectedUsers = [];
const setupSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);
        socket.on("register", (data) => {
            connectedUsers.push({ ...data, socketId: socket.id });
            console.log("Registered user:", data.userId, "as", data.role);
        });
        socket.on("sendMessage", async (data) => {
            // البحث أو إنشاء المحادثة
            const conversation = await Conversation_1.ConversationModel.findOneAndUpdate({
                user: data.fromModel === "User" ? data.from : data.to,
                admin: data.fromModel === "Admin" ? data.from : data.to,
            }, { lastMessageAt: new Date(), $inc: { [`unread.${data.toModel.toLowerCase()}`]: 1 } }, { upsert: true, new: true });
            // حفظ الرسالة
            const newMessage = new Message_1.MessageModel({
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
