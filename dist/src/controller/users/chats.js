"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = exports.sendMessage = void 0;
const Message_1 = require("../../models/shema/Message");
const chat_1 = require("../../models/shema/chat");
const auth_1 = require("../../utils/auth");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
// 📨 إرسال رسالة جديدة (User فقط)
const sendMessage = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        throw new Errors_1.UnauthorizedError("No token provided");
    const decoded = (0, auth_1.verifyToken)(token);
    const { chatId } = req.params;
    const { content } = req.body;
    if (!content)
        throw new BadRequest_1.BadRequest("Message content is required");
    // 🛑 السماح لليوزر فقط
    if (!(decoded.userType === "Student" || decoded.userType === "Graduated")) {
        throw new Errors_1.UnauthorizedError("Only users can send messages");
    }
    const chat = await chat_1.ChatModel.findById(chatId);
    if (!chat)
        throw new Errors_1.NotFound("Chat not found");
    const msg = await Message_1.MessageModel.create({
        chat: chatId,
        senderModel: "User", // 👈 دايمًا User
        sender: decoded.id,
        content,
        readBy: [decoded.id],
    });
    (0, response_1.SuccessResponse)(res, msg);
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    const { chatId } = req.params;
    if (!chatId)
        throw new BadRequest_1.BadRequest("Chat id is required");
    const chat = await chat_1.ChatModel.findById(chatId);
    if (!chat)
        throw new Errors_1.NotFound("Chat not found");
    const messages = await Message_1.MessageModel.find({ chat: chatId })
        .sort({ createdAt: 1 })
        .populate("sender");
    (0, response_1.SuccessResponse)(res, messages);
};
exports.getMessages = getMessages;
