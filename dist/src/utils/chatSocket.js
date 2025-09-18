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
const Room_1 = require("../models/shema/Room");
const Message_1 = require("../models/shema/Message");
const setupChatSockets = (io) => {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token)
                return next(new Error("Authentication error"));
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            let user = null;
            if (decoded.role === "Admin")
                user = await Admin_1.AdminModel.findById(decoded.id);
            else
                user = await User_1.UserModel.findById(decoded.id);
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
        catch {
            next(new Error("Authentication error"));
        }
    });
    io.on("connection", (socket) => {
        console.log(`✅ ${socket.role} connected: ${socket.username}`);
        socket.on("join-room", async (roomId) => {
            const room = await Room_1.RoomModel.findById(roomId);
            if (!room)
                return socket.emit("error", { message: "Room not found" });
            const isParticipant = room.participants.some((p) => p.user.toString() === socket.userId);
            if (!isParticipant)
                return socket.emit("error", { message: "Unauthorized" });
            socket.join(roomId);
            const messages = await Message_1.MessageModel.find({ room: roomId, isDeleted: { $ne: true } });
            socket.emit("room-messages", messages);
            socket.emit("joined-room", { roomId });
        });
        socket.on("send-message", async (data) => {
            const { roomId, content, attachment } = data;
            let room = null;
            if (roomId) {
                room = await Room_1.RoomModel.findById(roomId);
                if (!room)
                    return socket.emit("error", { message: "Room not found" });
            }
            const message = await Message_1.MessageModel.create({
                room: room?._id || null,
                sender: { user: new mongoose_1.default.mongo.ObjectId(socket.userId), role: socket.role },
                content: content || null,
                attachment: attachment || null,
                deliveredTo: room
                    ? room.participants.map((p) => p.user.toString())
                    : [data.roomId],
            });
            if (room)
                io.to(room._id.toString()).emit("new-message", message);
            else
                io.to(data.roomId).emit("new-message", message);
            message.deliveredTo
                .filter((uid) => uid !== socket.userId)
                .forEach((uid) => {
                io.to(uid).emit("new-message-notification", {
                    roomId: room?._id || data.roomId,
                    messageId: message._id,
                    sender: socket.username,
                });
            });
        });
        socket.on("seen-message", async ({ roomId, messageId }) => {
            const message = await Message_1.MessageModel.findById(messageId);
            if (!message || !socket.userId)
                return;
            if (!message.seenBy.some((u) => u.toString() === socket.userId)) {
                message.seenBy.push(new mongoose_1.default.mongo.ObjectId(socket.userId));
                await message.save();
                io.to(roomId).emit("message-seen", { messageId, userId: socket.userId });
            }
        });
        socket.on("typing-start", (roomId) => {
            socket.to(roomId).emit("user-typing", {
                userId: socket.userId,
                username: socket.username,
                role: socket.role,
            });
        });
        socket.on("typing-stop", (roomId) => {
            socket.to(roomId).emit("user-stopped-typing", {
                userId: socket.userId,
                username: socket.username,
                role: socket.role,
            });
        });
        socket.on("create-group", async (data) => {
            if (socket.role !== "Admin")
                return;
            const participants = data.memberIds.map((id) => ({ user: new mongoose_1.default.mongo.ObjectId(id), role: "User" }));
            participants.push({ user: new mongoose_1.default.mongo.ObjectId(socket.userId), role: "Admin" });
            const group = await Room_1.RoomModel.create({
                type: "group",
                name: data.name,
                participants,
                createdBy: { user: new mongoose_1.default.mongo.ObjectId(socket.userId), role: "Admin" },
            });
            socket.join(group._id.toString());
            participants.forEach((p) => io.to(p.user.toString()).emit("new-group-notification", { roomId: group._id, name: group.name }));
            io.to(group._id.toString()).emit("group-updated", group);
        });
        socket.on("add-to-group", async (data) => {
            if (socket.role !== "Admin")
                return;
            const room = await Room_1.RoomModel.findById(data.roomId);
            if (!room)
                return socket.emit("error", { message: "Room not found" });
            if (!room.participants.some((p) => p.user.toString() === data.userId)) {
                room.participants.push({ user: new mongoose_1.default.mongo.ObjectId(data.userId), role: data.role });
                await room.save();
            }
            io.to(room._id.toString()).emit("group-updated", room);
            io.to(data.userId).emit("added-to-group", { roomId: room._id, name: room.name });
        });
        socket.on("remove-from-group", async (data) => {
            if (socket.role !== "Admin")
                return;
            const room = await Room_1.RoomModel.findById(data.roomId);
            if (!room)
                return socket.emit("error", { message: "Room not found" });
            room.participants = room.participants.filter((p) => p.user.toString() !== data.userId);
            await room.save();
            io.to(room._id.toString()).emit("group-updated", room);
            io.to(data.userId).emit("removed-from-group", { roomId: room._id });
        });
        socket.on("disconnect", async () => {
            if (!socket.userId)
                return;
            let user = null;
            if (socket.role === "Admin")
                user = await Admin_1.AdminModel.findById(socket.userId);
            else
                user = await User_1.UserModel.findById(socket.userId);
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
