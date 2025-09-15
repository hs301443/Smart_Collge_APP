import { Request, Response } from "express";
import { ConversationModel } from "../../models/shema/Conversation";
import { MessageModel } from "../../models/shema/Message";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { getIO } from "../../utils/chatSocket";

// 1️⃣ كل المحادثات الخاصة بيوزر
export const getUserConversations = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Only user can access conversations");

  const userId = req.user.id;

  const conversations = await ConversationModel.find({ user: userId })
    .populate("admin", "name email")
    .sort({ updatedAt: -1 });

  if (!conversations) throw new NotFound("No conversations found");

  SuccessResponse(res, { conversations });
};

// 2️⃣ كل الرسائل في محادثة معينة
export const getUserMessages = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Only user can access messages");

  const { conversationId } = req.params;
  if (!conversationId) throw new BadRequest("conversationId is required");

  const messages = await MessageModel.find({ conversation: conversationId }).sort({ createdAt: 1 });
  if (!messages) throw new NotFound("No messages found");

  SuccessResponse(res, { messages });
};

// 3️⃣ إرسال رسالة
export const sendMessageByUser = async (req: Request, res: Response) => {
  const { userId, adminId, text } = req.body;

  let conversation = await ConversationModel.findOne({ user: userId, admin: adminId });
  if (!conversation) {
    conversation = await ConversationModel.create({ user: userId, admin: adminId });
  }

  const message = await MessageModel.create({
    conversation: conversation._id,
    from: userId,
    fromModel: "User",
    to: adminId,
    toModel: "Admin",
    text,
  });

  conversation.lastMessageAt = new Date();
  if (!conversation.unread) conversation.unread = { user: 0, admin: 0 };
  conversation.unread.admin += 1;
  await conversation.save();

  // 🔥 real-time للـ admin
  const io = getIO();
  io.to(adminId.toString()).emit("receiveMessage", { conversation, message });

  SuccessResponse(res, { conversation, message });
};

// 4️⃣ تعليم رسالة واحدة كمقروءة
export const markUserMessageAsRead = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Only user can mark messages as read");

  const { messageId } = req.params;
  if (!messageId) throw new BadRequest("messageId is required");

  const message = await MessageModel.findById(messageId);
  if (!message) throw new NotFound("Message not found");

  message.seenAt = new Date();
  await message.save();

  // 🔥 real-time للطرف الآخر (الـ Admin)
  const io = getIO();
  io.to(message.from.toString()).emit("messageSeen", { messageId });

  SuccessResponse(res, { message });
};

// 5️⃣ تعليم كل الرسائل في محادثة كمقروءة
export const markUserConversationAsRead = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Only user can mark messages as read");

  const { conversationId } = req.params;
  if (!conversationId) throw new BadRequest("conversationId is required");

  const conversation = await ConversationModel.findById(conversationId);
  if (!conversation) throw new NotFound("Conversation not found");

  if (!conversation.unread) conversation.unread = { user: 0, admin: 0 };
  conversation.unread.user = 0;
  await conversation.save();

  // 🔥 real-time للـ Admin إن المحادثة اتقريت
  const io = getIO();
  io.to(conversation.admin.toString()).emit("conversationRead", { conversationId });

  SuccessResponse(res, { conversation });
};

// 6️⃣ حذف رسالة واحدة
export const deleteUserMessage = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Only user can delete messages");

  const { messageId } = req.params;
  if (!messageId) throw new BadRequest("messageId is required");

  const message = await MessageModel.findByIdAndDelete(messageId);
  if (!message) throw new NotFound("Message not found");

  // 🔥 real-time للطرف الآخر
  const io = getIO();
  io.to(message.to.toString()).emit("messageDeleted", { messageId });

  SuccessResponse(res, { message });
};

// 7️⃣ حذف محادثة كاملة
export const deleteUserConversation = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Only user can delete conversations");

  const { conversationId } = req.params;
  if (!conversationId) throw new BadRequest("conversationId is required");

  const conversation = await ConversationModel.findByIdAndDelete(conversationId);
  if (!conversation) throw new NotFound("Conversation not found");

  await MessageModel.deleteMany({ conversation: conversationId });

  // 🔥 real-time للـ Admin
  const io = getIO();
  io.to(conversation.admin.toString()).emit("conversationDeleted", { conversationId });

  SuccessResponse(res, { message: "Conversation and its messages deleted" });
};

// 8️⃣ عدد الرسائل الغير مقروءة لليوزر
export const getUserUnreadCount = async (req: Request, res: Response) => {
if (!req.user || !req.user.id) {
  throw new UnauthorizedError("Only user can get unread count");
}
 const userId = req.user.id;
  const conversations = await ConversationModel.find({ user: userId });
  const totalUnread = conversations.reduce((sum, conv) => {
    return sum + (conv.unread?.user || 0);
  }, 0);
  const io = getIO();
  io.to(userId.toString()).emit("unreadCount", { unread: totalUnread });

  SuccessResponse(res, { unread: totalUnread });
};
