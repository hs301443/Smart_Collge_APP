"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.getConversation = exports.deleteConversation = exports.deleteMessage = exports.markAsRead = exports.markMessageAsRead = exports.sendMessageByAdmin = exports.getMessages = exports.getAdminConversations = void 0;
const Conversation_1 = require("../../models/shema/Conversation");
const Message_1 = require("../../models/shema/Message");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const Errors_2 = require("../../Errors");
const response_1 = require("../../utils/response");
const chatSocket_1 = require("../../utils/chatSocket");
// 1️⃣ كل المحادثات الخاصة بإدمن
const getAdminConversations = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const adminId = req.user?.id; // مفروض الأدمن بيكون لوج إن وداخل بالتوكن\
    const conversations = await Conversation_1.ConversationModel.find({ admin: adminId })
        .populate("user", "name email") // عرض بيانات اليوزر
        .sort({ updatedAt: -1 });
    if (!conversations)
        throw new Errors_1.NotFound("No conversations found");
    (0, response_1.SuccessResponse)(res, { success: true, conversations });
};
exports.getAdminConversations = getAdminConversations;
// 2️⃣ كل الرسائل في محادثة معينة
const getMessages = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
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
const sendMessageByAdmin = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const { adminId, userId, text } = req.body;
    let conversation = await Conversation_1.ConversationModel.findOne({ admin: adminId, user: userId });
    if (!conversation) {
        conversation = await Conversation_1.ConversationModel.create({
            admin: adminId,
            user: userId,
        });
    }
    const message = await Message_1.MessageModel.create({
        conversation: conversation._id,
        from: adminId,
        fromModel: "Admin",
        to: userId,
        toModel: "User",
        text,
    });
    conversation.lastMessageAt = new Date();
    if (!conversation.unread) {
        conversation.unread = { user: 0, admin: 0 };
    }
    conversation.unread.user += 1;
    await conversation.save();
    // 🔥 ريل تايم
    const io = (0, chatSocket_1.getIO)();
    io.to(userId).emit("receiveMessage", message); // تبعت للـ user
    io.to(adminId).emit("messageSent", message); // تبعت للـ admin نفسه
    return (0, response_1.SuccessResponse)(res, { conversation, message });
};
exports.sendMessageByAdmin = sendMessageByAdmin;
// 4️⃣ تعليم رسالة واحدة كمقروءة
const markMessageAsRead = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const { messageId } = req.params;
    if (!messageId)
        throw new BadRequest_1.BadRequest("messageId is required");
    const message = await Message_1.MessageModel.findById(messageId);
    if (!message)
        throw new Errors_1.NotFound("Message not found");
    message.seenAt = new Date();
    await message.save();
    // 🔥 ريل تايم
    const io = (0, chatSocket_1.getIO)();
    io.to(message.from.toString()).emit("messageRead", message);
    (0, response_1.SuccessResponse)(res, { success: true, message });
};
exports.markMessageAsRead = markMessageAsRead;
// 5️⃣ تعليم كل الرسائل في محادثة كمقروءة
const markAsRead = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
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
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const { messageId } = req.params;
    if (!messageId)
        throw new BadRequest_1.BadRequest("messageId is required");
    const message = await Message_1.MessageModel.findByIdAndDelete(messageId);
    if (!message)
        throw new Errors_1.NotFound("Message not found");
    // 🔥 ريل تايم
    const io = (0, chatSocket_1.getIO)();
    io.to(message.to.toString()).emit("messageDeleted", messageId);
    (0, response_1.SuccessResponse)(res, { success: true, message });
};
exports.deleteMessage = deleteMessage;
// 7️⃣ حذف محادثة كاملة
const deleteConversation = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const { conversationId } = req.params;
    if (!conversationId)
        throw new BadRequest_1.BadRequest("conversationId is required");
    const conversation = await Conversation_1.ConversationModel.findByIdAndDelete(conversationId);
    if (!conversation)
        throw new Errors_1.NotFound("Conversation not found");
    await Message_1.MessageModel.deleteMany({ conversation: conversationId });
    // 🔥 ريل تايم
    const io = (0, chatSocket_1.getIO)();
    io.to(conversation.user.toString()).emit("conversationDeleted", conversationId);
    (0, response_1.SuccessResponse)(res, { success: true, message: "Conversation and its messages deleted" });
};
exports.deleteConversation = deleteConversation;
// ✅ محادثة واحدة
const getConversation = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const { conversationId } = req.params;
    if (!conversationId)
        throw new BadRequest_1.BadRequest("conversationId is required");
    const conversation = await Conversation_1.ConversationModel.findById(conversationId)
        .populate("user", "name email")
        .populate("admin", "name email");
    if (!conversation)
        throw new Errors_1.NotFound("Conversation not found");
    return (0, response_1.SuccessResponse)(res, { conversation });
};
exports.getConversation = getConversation;
// ✅ عدد الرسائل الغير مقروءة للأدمن
const getUnreadCount = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const adminId = req.user.id;
    const conversations = await Conversation_1.ConversationModel.find({ admin: adminId });
    const totalUnread = conversations.reduce((sum, conv) => {
        return sum + (conv.unread?.admin || 0);
    }, 0);
    return (0, response_1.SuccessResponse)(res, { unread: totalUnread });
};
exports.getUnreadCount = getUnreadCount;
