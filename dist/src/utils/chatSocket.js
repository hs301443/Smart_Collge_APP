"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChatSockets = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/shema/auth/User");
const Admin_1 = require("../models/shema/auth/Admin");
const Message_1 = require("../models/shema/Message");
const Room_1 = require("../models/shema/Room");
const setupChatSockets = (io) => {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token)
                return next(new Error("Authentication error"));
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            let user = null;
            if (decoded.role === "Admin") {
                user = await Admin_1.AdminModel.findById(decoded.id);
            }
            else {
                user = await User_1.UserModel.findById(decoded.id);
            }
            if (!user)
                return next(new Error("Authentication error"));
            socket.userId = user._id.toString();
            socket.username = user.name;
            socket.role = decoded.role;
            user.isOnline = true;
            user.lastSeen = new Date();
            await user.save();
            next();
        }
        catch (err) {
            next(new Error("Authentication error"));
        }
    });
    io.on("connection", (socket) => {
        console.log(`✅ ${socket.role} connected: ${socket.username}`);
        socket.on("join-room", async (roomId) => {
            const room = await Room_1.RoomModel.findById(roomId);
            if (!room)
                return socket.emit("error", { message: "Room not found" });
            const userObjectId = new mongoose_1.default.Types.ObjectId(socket.userId);
            if (socket.role === "Admin" || room.members.some(memberId => memberId.equals(userObjectId))) {
                socket.join(roomId);
                socket.emit("joined-room", { roomId });
            }
            else {
                socket.emit("error", { message: "Unauthorized" });
            }
        });
        socket.on("send-message", async (data) => {
            const { roomId, content } = data;
            const room = await Room_1.RoomModel.findById(roomId);
            if (!room)
                return socket.emit("error", { message: "Room not found" });
            const userObjectId = new mongoose_1.default.Types.ObjectId(socket.userId);
            if (!(socket.role === "Admin" || room.members.some(memberId => memberId.equals(userObjectId)))) {
                return socket.emit("error", { message: "Unauthorized" });
            }
            const message = await Message_1.MessageModel.create({
                sender: socket.userId,
                room: roomId,
                content,
                timestamp: new Date(),
            });
            io.to(roomId).emit("new-message", {
                id: message._id,
                sender: socket.username,
                role: socket.role,
                roomId,
                content,
                timestamp: message.timestamp,
            });
        });
        socket.on("typing-start", (roomId) => {
            socket.to(roomId).emit("user-typing", { userId: socket.userId, username: socket.username, role: socket.role });
        });
        socket.on("typing-stop", (roomId) => {
            socket.to(roomId).emit("user-stopped-typing", { userId: socket.userId, username: socket.username, role: socket.role });
        });
        socket.on("disconnect", async () => {
            console.log(`❌ ${socket.role} disconnected: ${socket.username}`);
            let user = null;
            if (socket.role === "Admin") {
                user = await Admin_1.AdminModel.findById(socket.userId);
            }
            else {
                user = await User_1.UserModel.findById(socket.userId);
            }
            if (user) {
                user.isOnline = false;
                user.lastSeen = new Date();
                await user.save();
            }
            socket.broadcast.emit("user-offline", { userId: socket.userId, role: socket.role });
        });
    });
};
exports.setupChatSockets = setupChatSockets;
