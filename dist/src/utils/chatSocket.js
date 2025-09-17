"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const User_1 = require("../models/shema/auth/User");
const Admin_1 = require("../models/shema/auth/Admin");
const Message_1 = require("../models/shema/Message");
const setupSocket = (io) => {
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error("Authentication error"));
        try {
            // TODO: تحقق من JWT هنا
            // مثال:
            // const decoded = jwt.verify(token, process.env.JWT_SECRET)
            // socket.userId = decoded.id  أو socket.adminId
            // socket.role = "User" أو "Admin"
            next();
        }
        catch (err) {
            next(new Error("Authentication error"));
        }
    });
    io.on("connection", (socket) => {
        console.log(`${socket.role} connected: ${socket.userId || socket.adminId}`);
        // تحديث حالة Online عند الاتصال
        if (socket.role === "User" && socket.userId) {
            User_1.UserModel.findByIdAndUpdate(socket.userId, { isOnline: true }).exec();
        }
        else if (socket.role === "Admin" && socket.adminId) {
            Admin_1.AdminModel.findByIdAndUpdate(socket.adminId, { isOnline: true }).exec();
        }
        // انضمام لغرفة خاصة بين طرفين
        socket.on("join-private", ({ userId, adminId }) => {
            const roomId = [userId, adminId].sort().join("_");
            socket.join(roomId);
        });
        // إرسال رسالة
        socket.on("private-message", async ({ userId, adminId, content }) => {
            const roomId = [userId, adminId].sort().join("_");
            let message;
            if (socket.role === "User") {
                message = await Message_1.MessageModel.create({ senderUser: socket.userId, receiverAdmin: adminId, content });
            }
            else {
                message = await Message_1.MessageModel.create({ senderAdmin: socket.adminId, receiverUser: userId, content });
            }
            io.to(roomId).emit("new-private-message", message);
        });
        // typing indicators
        socket.on("typing-start", ({ userId, adminId }) => {
            const roomId = [userId, adminId].sort().join("_");
            socket.to(roomId).emit("user-typing", { userId: socket.userId, adminId: socket.adminId });
        });
        socket.on("typing-stop", ({ userId, adminId }) => {
            const roomId = [userId, adminId].sort().join("_");
            socket.to(roomId).emit("user-stopped-typing", { userId: socket.userId, adminId: socket.adminId });
        });
        // عند disconnect
        socket.on("disconnect", async () => {
            if (socket.role === "User" && socket.userId) {
                await User_1.UserModel.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
            }
            if (socket.role === "Admin" && socket.adminId) {
                await Admin_1.AdminModel.findByIdAndUpdate(socket.adminId, { isOnline: false, lastSeen: new Date() });
            }
        });
    });
};
exports.setupSocket = setupSocket;
