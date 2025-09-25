"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesByChatId = exports.getAdminChats = exports.sendMessageByAdmin = void 0;
const Message_1 = require("../../models/shema/Message");
const chat_1 = require("../../models/shema/chat");
const auth_1 = require("../../utils/auth");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
// 📨 إرسال رسالة من الأدمن
const sendMessageByAdmin = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        throw new Errors_1.UnauthorizedError("No token provided");
    const decoded = (0, auth_1.verifyToken)(token);
    // ✅ التحقق من الدور مباشرة
    if (!decoded.role || (decoded.role !== "Admin" && decoded.role !== "SuperAdmin")) {
        throw new Errors_1.UnauthorizedError("Only admins can send messages");
    }
    const { chatId } = req.params;
    const { content } = req.body;
    if (!content)
        throw new BadRequest_1.BadRequest("Message content is required");
    const chat = await chat_1.ChatModel.findById(chatId);
    if (!chat)
        throw new Errors_1.NotFound("Chat not found");
    const msg = await Message_1.MessageModel.create({
        chat: chatId,
        senderModel: "Admin",
        sender: decoded.id,
        content,
        readBy: [decoded.id],
    });
    (0, response_1.SuccessResponse)(res, msg);
};
exports.sendMessageByAdmin = sendMessageByAdmin;
// 📩 جلب كل الشاتات الخاصة بالأدمن
const getAdminChats = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        throw new Errors_1.UnauthorizedError("No token provided");
    const decoded = (0, auth_1.verifyToken)(token);
    if (!decoded.role || (decoded.role !== "Admin" && decoded.role !== "SuperAdmin")) {
        throw new Errors_1.UnauthorizedError("Only admins can view chats");
    }
    // 📌 SuperAdmin يشوف كل الشاتات
    let chats;
    if (decoded.role === "SuperAdmin") {
        chats = await chat_1.ChatModel.find()
            .populate("user", "name email role")
            .populate("admin", "name email role")
            .sort({ updatedAt: -1 });
    }
    else {
        chats = await chat_1.ChatModel.find({ admin: decoded.id })
            .populate("user", "name email role")
            .sort({ updatedAt: -1 });
    }
    (0, response_1.SuccessResponse)(res, chats);
};
exports.getAdminChats = getAdminChats;
// 📜 جلب الرسائل لشات محدد
const getMessagesByChatId = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        throw new Errors_1.UnauthorizedError("No token provided");
    const decoded = (0, auth_1.verifyToken)(token);
    if (!decoded.role || (decoded.role !== "Admin" && decoded.role !== "SuperAdmin")) {
        throw new Errors_1.UnauthorizedError("Only admins can view messages");
    }
    const { chatId } = req.params;
    if (!chatId)
        throw new BadRequest_1.BadRequest("Chat ID is required");
    const chat = await chat_1.ChatModel.findById(chatId);
    if (!chat)
        throw new Errors_1.NotFound("Chat not found");
    const messages = await Message_1.MessageModel.find({ chat: chatId })
        .sort({ createdAt: 1 })
        .populate("sender", "name email role");
    (0, response_1.SuccessResponse)(res, messages);
};
exports.getMessagesByChatId = getMessagesByChatId;
