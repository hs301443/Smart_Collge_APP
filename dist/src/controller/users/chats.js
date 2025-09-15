"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserUnreadCount = exports.deleteUserConversation = exports.deleteUserMessage = exports.markUserConversationAsRead = exports.markUserMessageAsRead = exports.sendMessageByUser = exports.getUserMessages = exports.getUserConversations = void 0;
const Conversation_1 = require("../../models/shema/Conversation");
const Message_1 = require("../../models/shema/Message");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const chatSocket_1 = require("../../utils/chatSocket");
// 1️⃣ كل المحادثات الخاصة بيوزر
const getUserConversations = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Only user can access conversations");
    const userId = req.user.id;
    const conversations = await Conversation_1.ConversationModel.find({ user: userId })
        .populate("admin", "name email")
        .sort({ updatedAt: -1 });
    if (!conversations)
        throw new Errors_1.NotFound("No conversations found");
    (0, response_1.SuccessResponse)(res, { conversations });
};
exports.getUserConversations = getUserConversations;
// 2️⃣ كل الرسائل في محادثة معينة
const getUserMessages = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Only user can access messages");
    const { conversationId } = req.params;
    if (!conversationId)
        throw new BadRequest_1.BadRequest("conversationId is required");
    const messages = await Message_1.MessageModel.find({ conversation: conversationId }).sort({ createdAt: 1 });
    if (!messages)
        throw new Errors_1.NotFound("No messages found");
    (0, response_1.SuccessResponse)(res, { messages });
};
exports.getUserMessages = getUserMessages;
// 3️⃣ إرسال رسالة
const sendMessageByUser = async (req, res) => {
    const { userId, adminId, text } = req.body;
    let conversation = await Conversation_1.ConversationModel.findOne({ user: userId, admin: adminId });
    if (!conversation) {
        conversation = await Conversation_1.ConversationModel.create({ user: userId, admin: adminId });
    }
    const message = await Message_1.MessageModel.create({
        conversation: conversation._id,
        from: userId,
        fromModel: "User",
        to: adminId,
        toModel: "Admin",
        text,
    });
    conversation.lastMessageAt = new Date();
    if (!conversation.unread)
        conversation.unread = { user: 0, admin: 0 };
    conversation.unread.admin += 1;
    await conversation.save();
    // 🔥 real-time للـ admin
    const io = (0, chatSocket_1.getIO)();
    io.to(adminId.toString()).emit("receiveMessage", { conversation, message });
    (0, response_1.SuccessResponse)(res, { conversation, message });
};
exports.sendMessageByUser = sendMessageByUser;
// 4️⃣ تعليم رسالة واحدة كمقروءة
const markUserMessageAsRead = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Only user can mark messages as read");
    const { messageId } = req.params;
    if (!messageId)
        throw new BadRequest_1.BadRequest("messageId is required");
    const message = await Message_1.MessageModel.findById(messageId);
    if (!message)
        throw new Errors_1.NotFound("Message not found");
    message.seenAt = new Date();
    await message.save();
    // 🔥 real-time للطرف الآخر (الـ Admin)
    const io = (0, chatSocket_1.getIO)();
    io.to(message.from.toString()).emit("messageSeen", { messageId });
    (0, response_1.SuccessResponse)(res, { message });
};
exports.markUserMessageAsRead = markUserMessageAsRead;
// 5️⃣ تعليم كل الرسائل في محادثة كمقروءة
const markUserConversationAsRead = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Only user can mark messages as read");
    const { conversationId } = req.params;
    if (!conversationId)
        throw new BadRequest_1.BadRequest("conversationId is required");
    const conversation = await Conversation_1.ConversationModel.findById(conversationId);
    if (!conversation)
        throw new Errors_1.NotFound("Conversation not found");
    if (!conversation.unread)
        conversation.unread = { user: 0, admin: 0 };
    conversation.unread.user = 0;
    await conversation.save();
    // 🔥 real-time للـ Admin إن المحادثة اتقريت
    const io = (0, chatSocket_1.getIO)();
    io.to(conversation.admin.toString()).emit("conversationRead", { conversationId });
    (0, response_1.SuccessResponse)(res, { conversation });
};
exports.markUserConversationAsRead = markUserConversationAsRead;
// 6️⃣ حذف رسالة واحدة
const deleteUserMessage = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Only user can delete messages");
    const { messageId } = req.params;
    if (!messageId)
        throw new BadRequest_1.BadRequest("messageId is required");
    const message = await Message_1.MessageModel.findByIdAndDelete(messageId);
    if (!message)
        throw new Errors_1.NotFound("Message not found");
    // 🔥 real-time للطرف الآخر
    const io = (0, chatSocket_1.getIO)();
    io.to(message.to.toString()).emit("messageDeleted", { messageId });
    (0, response_1.SuccessResponse)(res, { message });
};
exports.deleteUserMessage = deleteUserMessage;
// 7️⃣ حذف محادثة كاملة
const deleteUserConversation = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Only user can delete conversations");
    const { conversationId } = req.params;
    if (!conversationId)
        throw new BadRequest_1.BadRequest("conversationId is required");
    const conversation = await Conversation_1.ConversationModel.findByIdAndDelete(conversationId);
    if (!conversation)
        throw new Errors_1.NotFound("Conversation not found");
    await Message_1.MessageModel.deleteMany({ conversation: conversationId });
    // 🔥 real-time للـ Admin
    const io = (0, chatSocket_1.getIO)();
    io.to(conversation.admin.toString()).emit("conversationDeleted", { conversationId });
    (0, response_1.SuccessResponse)(res, { message: "Conversation and its messages deleted" });
};
exports.deleteUserConversation = deleteUserConversation;
// 8️⃣ عدد الرسائل الغير مقروءة لليوزر
const getUserUnreadCount = async (req, res) => {
    if (!req.user || !req.user.id) {
        throw new Errors_1.UnauthorizedError("Only user can get unread count");
    }
    const userId = req.user.id;
    const conversations = await Conversation_1.ConversationModel.find({ user: userId });
    const totalUnread = conversations.reduce((sum, conv) => {
        return sum + (conv.unread?.user || 0);
    }, 0);
    const io = (0, chatSocket_1.getIO)();
    io.to(userId.toString()).emit("unreadCount", { unread: totalUnread });
    (0, response_1.SuccessResponse)(res, { unread: totalUnread });
};
exports.getUserUnreadCount = getUserUnreadCount;
