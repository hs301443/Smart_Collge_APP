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
const firebase_1 = require("./firebase");
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
            let userType = null;
            if (payload.userType === "Student" || payload.userType === "Graduated") {
                user = await User_1.UserModel.findById(payload.id);
                userType = "user";
            }
            else if (payload.userType === "Admin" || payload.userType === "SuperAdmin") {
                user = await Admin_1.AdminModel.findById(payload.id);
                userType = "admin";
            }
            if (!user)
                return next(new Error("Invalid user"));
            socket.user = user;
            socket.userType = userType;
            next();
        }
        catch (err) {
            next(err);
        }
    });
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
        // 🎯 join chat
        socket.on("join_chat", async () => {
            try {
                let chat;
                if (userType === "user") {
                    const admin = await Admin_1.AdminModel.findOne();
                    if (!admin)
                        return socket.emit("error", "No admin found");
                    chat =
                        (await chat_1.ChatModel.findOne({ user: user._id, admin: admin._id })) ||
                            (await chat_1.ChatModel.create({ user: user._id, admin: admin._id }));
                    socket.join(`chat_${chat._id}`);
                    const messages = await Message_1.MessageModel.find({ chat: chat._id })
                        .sort({ createdAt: 1 })
                        .populate("sender");
                    socket.emit("chat_history", { chatId: chat._id, messages });
                }
                else {
                    socket.emit("error", "Admin must specify chatId explicitly");
                }
            }
            catch (err) {
                console.error(err);
                socket.emit("error", "Join chat failed");
            }
        });
        // 🎯 send_message
        socket.on("send_message", async ({ content, chatId }) => {
            try {
                if (!content)
                    return;
                let chat;
                if (userType === "user") {
                    const admin = await Admin_1.AdminModel.findOne();
                    if (!admin)
                        return socket.emit("error", "No admin found");
                    chat =
                        (await chat_1.ChatModel.findOne({ user: user._id, admin: admin._id })) ||
                            (await chat_1.ChatModel.create({ user: user._id, admin: admin._id }));
                }
                else {
                    if (!chatId)
                        return socket.emit("error", "chatId is required for admin");
                    chat = await chat_1.ChatModel.findById(chatId);
                }
                if (!chat)
                    return socket.emit("error", "Chat not found");
                const msg = await Message_1.MessageModel.create({
                    chat: chat._id,
                    senderModel: userType === "user" ? "User" : "Admin",
                    sender: user._id,
                    content,
                    readBy: [user._id],
                });
                const populatedMsg = await msg.populate("sender");
                // ابعت الرسالة لكل الـ sockets في الغرفة
                io.to(`chat_${chat._id}`).emit("message", populatedMsg);
                // 🔔 FCM Notification باسم المرسل
                let targetToken = null;
                if (userType === "user") {
                    const admin = await Admin_1.AdminModel.findOne();
                    targetToken = admin?.fcmtoken || null;
                }
                else {
                    const userModel = await User_1.UserModel.findById(chat.user);
                    targetToken = userModel?.fcmtoken || null;
                }
                if (targetToken) {
                    const sender = populatedMsg.sender;
                    const senderName = sender?.name || (userType === "user" ? "User" : "Admin");
                    await firebase_1.messaging.send({
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
            }
            catch (err) {
                console.error(err);
                socket.emit("error", "Send message failed");
            }
        });
        // 🎯 typing
        socket.on("typing", async ({ chatId, isTyping }) => {
            if (!chatId)
                return;
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
                        User_1.UserModel.findByIdAndUpdate(user._id, { isOnline: false, lastSeen: new Date() }).exec();
                    }
                    else {
                        Admin_1.AdminModel.findByIdAndUpdate(user._id, { isOnline: false, lastSeen: new Date() }).exec();
                    }
                }
            }
            console.log(`❌ ${userType} disconnected: ${user._id}`);
        });
    });
}
