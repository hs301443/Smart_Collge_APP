"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteConversation = exports.deleteMessage = exports.markAsRead = exports.markMessageAsRead = exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
const Conversation_1 = require("../../models/shema/Conversation");
const Message_1 = require("../../models/shema/Message");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const Errors_2 = require("../../Errors");
const response_1 = require("../../utils/response");
// 1️⃣ كل المحادثات الخاصة بإدمن
const getConversations = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("Only admin can access conversations");
    const adminId = req.user._id;
    const conversations = await Conversation_1.ConversationModel.find({ admin: adminId })
        .populate("user", "name email")
        .sort({ lastMessageAt: -1 });
    if (!conversations)
        throw new Errors_1.NotFound("No conversations found");
    (0, response_1.SuccessResponse)(res, { success: true, conversations });
    // res.json({ success: true, conversations });
};
exports.getConversations = getConversations;
// 2️⃣ كل الرسائل في محادثة معينة
const getMessages = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("Only admin can access messages");
    const { conversationId } = req.params;
    if (!conversationId)
        throw new BadRequest_1.BadRequest("conversationId is required");
    const messages = await Message_1.MessageModel.find({ conversation: conversationId }).sort({ createdAt: 1 });
    if (!messages)
        throw new Errors_1.NotFound("No messages found");
    (0, response_1.SuccessResponse)(res, { success: true, messages });
};
exports.getMessages = getMessages;
// 3️⃣ إرسال رسالة
const sendMessage = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("Only admin can send messages");
    const { conversationId } = req.params;
    const { text, attachments } = req.body;
    if (!conversationId || !text)
        throw new BadRequest_1.BadRequest("conversationId and text are required");
    const conversation = await Conversation_1.ConversationModel.findById(conversationId);
    if (!conversation)
        throw new Errors_1.NotFound("Conversation not found");
    const message = await Message_1.MessageModel.create({
        conversation: conversation._id,
        from: conversation.admin,
        fromModel: "Admin",
        to: conversation.user,
        toModel: "User",
        text,
        attachments: attachments || [],
    });
    conversation.lastMessageAt = new Date();
    if (!conversation.unread) {
        conversation.unread = { user: 0, admin: 0 };
    }
    conversation.unread.user += 1;
    await conversation.save();
    (0, response_1.SuccessResponse)(res, { success: true, message });
};
exports.sendMessage = sendMessage;
// 4️⃣ تعليم رسالة واحدة كمقروءة
const markMessageAsRead = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("Only admin can mark messages as read");
    const { messageId } = req.params;
    if (!messageId)
        throw new BadRequest_1.BadRequest("messageId is required");
    const message = await Message_1.MessageModel.findById(messageId);
    if (!message)
        throw new Errors_1.NotFound("Message not found");
    message.seenAt = new Date();
    await message.save();
    (0, response_1.SuccessResponse)(res, { success: true, message });
};
exports.markMessageAsRead = markMessageAsRead;
// 5️⃣ تعليم كل الرسائل في محادثة كمقروءة
const markAsRead = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("Only admin can mark messages as read");
    const { conversationId } = req.params;
    if (!conversationId)
        throw new BadRequest_1.BadRequest("conversationId is required");
    const conversation = await Conversation_1.ConversationModel.findById(conversationId);
    if (!conversation)
        throw new Errors_1.NotFound("Conversation not found");
    if (!conversation.unread) {
        conversation.unread = { user: 0, admin: 0 };
    }
    conversation.unread.admin = 0;
    await conversation.save();
    (0, response_1.SuccessResponse)(res, { success: true, conversation });
};
exports.markAsRead = markAsRead;
// 6️⃣ حذف رسالة واحدة
const deleteMessage = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("Only admin can delete messages");
    const { messageId } = req.params;
    if (!messageId)
        throw new BadRequest_1.BadRequest("messageId is required");
    const message = await Message_1.MessageModel.findByIdAndDelete(messageId);
    if (!message)
        throw new Errors_1.NotFound("Message not found");
    (0, response_1.SuccessResponse)(res, { success: true, message });
};
exports.deleteMessage = deleteMessage;
// 7️⃣ حذف محادثة كاملة
const deleteConversation = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("Only admin can delete conversations");
    const { conversationId } = req.params;
    if (!conversationId)
        throw new BadRequest_1.BadRequest("conversationId is required");
    const conversation = await Conversation_1.ConversationModel.findByIdAndDelete(conversationId);
    if (!conversation)
        throw new Errors_1.NotFound("Conversation not found");
    // حذف كل الرسائل المرتبطة
    await Message_1.MessageModel.deleteMany({ conversation: conversationId });
    (0, response_1.SuccessResponse)(res, { success: true, message: "Conversation and its messages deleted" });
};
exports.deleteConversation = deleteConversation;
