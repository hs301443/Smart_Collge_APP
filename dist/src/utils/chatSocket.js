"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initChatSocket = initChatSocket;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/shema/auth/User");
const Admin_1 = require("../models/shema/auth/Admin");
const chat_1 = require("../models/shema/chat");
const Message_1 = require("../models/shema/Message");
const onlineMap = new Map(); // userType:userId -> sockets
function initChatSocket(io) {
    // ✅ مصادقة قبل الاتصال
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token)
                return next(new Error("No token"));
            const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "changeme");
            let user = null;
            if (payload.type === "user") {
                user = await User_1.UserModel.findById(payload.id);
            }
            else if (payload.type === "admin") {
                user = await Admin_1.AdminModel.findById(payload.id);
            }
            if (!user)
                return next(new Error("Invalid user"));
            socket.user = user;
            socket.userType = payload.type;
            next();
        }
        catch (err) {
            next(err);
        }
    });
    // ✅ عند الاتصال
    io.on("connection", (socket) => {
        const user = socket.user;
        const userType = socket.userType;
        const key = `${userType}:${user._id}`;
        // سجل الأونلاين
        const set = onlineMap.get(key) ?? new Set();
        set.add(socket.id);
        onlineMap.set(key, set);
        if (userType === "user") {
            User_1.UserModel.findByIdAndUpdate(user._id, { isOnline: true }).exec();
        }
        else {
            Admin_1.AdminModel.findByIdAndUpdate(user._id, { isOnline: true }).exec();
        }
        console.log(`✅ ${userType} connected: ${user._id}`);
        // 🎯 join_chat
        socket.on("join_chat", async ({ chatId }) => {
            const chat = await chat_1.ChatModel.findById(chatId);
            if (!chat)
                return socket.emit("error", "Chat not found");
            socket.join(`chat_${chatId}`);
            const messages = await Message_1.MessageModel.find({ chat: chatId }).sort({ createdAt: 1 });
            socket.emit("chat_history", messages);
        });
        // 🎯 send_message
        socket.on("send_message", async ({ chatId, content }) => {
            if (!chatId || !content)
                return;
            const msg = await Message_1.MessageModel.create({
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
                        User_1.UserModel.findByIdAndUpdate(user._id, {
                            isOnline: false,
                            lastSeen: new Date(),
                        }).exec();
                    }
                    else {
                        Admin_1.AdminModel.findByIdAndUpdate(user._id, {
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
