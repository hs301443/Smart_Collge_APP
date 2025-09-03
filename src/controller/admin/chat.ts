import { Request, Response } from "express";
import { ConversationModel } from "../../models/shema/Conversation";
import { MessageModel } from "../../models/shema/Message";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
// 1️⃣ كل المحادثات الخاصة بإدمن

export const getAdminConversations = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Only admin can access conversations");
    const adminId = req.user?.id; // مفروض الأدمن بيكون لوج إن وداخل بالتوكن\

    const conversations = await ConversationModel.find({ admin: adminId })
      .populate("user", "name email") // عرض بيانات اليوزر
      .sort({ updatedAt: -1 });
        if(!conversations) throw new NotFound("No conversations found");

    SuccessResponse(res, { success: true, conversations });
  };

// 2️⃣ كل الرسائل في محادثة معينة
export const getMessages = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Only admin can access messages");
  const { conversationId } = req.params;
  if (!conversationId) throw new BadRequest("conversationId is required");
  const messages = await MessageModel.find({ conversation: conversationId }).sort({ createdAt: 1 });
    if(!messages) throw new NotFound("No messages found"); 
        SuccessResponse(res, { success: true, messages });
};

// 3️⃣ إرسال رسالة
export const sendMessageByAdmin = async (req: Request, res: Response) => {
  const { adminId, userId, text } = req.body;

  // 1- دور على محادثة موجودة
  let conversation = await ConversationModel.findOne({ admin: adminId, user: userId });

  // 2- لو مش موجودة اعمل محادثة جديدة
  if (!conversation) {
    conversation = await ConversationModel.create({
      admin: adminId,
      user: userId,
    });
  }

  // 3- سجل الرسالة
  const message = await MessageModel.create({
    conversation: conversation._id,
    from: adminId,
    fromModel: "Admin",
    to: userId,
    toModel: "User",
    text,
  });

  // 4- حدّث آخر رسالة وتاريخها
  conversation.lastMessageAt = new Date();
  if (!conversation.unread) {
    conversation.unread = { user: 0, admin: 0 };
  }
  conversation.unread.user += 1; // تزود للـ user عشان عنده رسالة جديدة
  await conversation.save();

  return SuccessResponse(res, { conversation, message });
};
// 4️⃣ تعليم رسالة واحدة كمقروءة
export const markMessageAsRead = async (req: Request, res: Response) => {
  if( !req.user) throw new UnauthorizedError("Only admin can mark messages as read");
  const { messageId } = req.params;
  if (!messageId) throw new BadRequest("messageId is required");  
  const message = await MessageModel.findById(messageId);
    if (!message) throw new NotFound("Message not found");
  message.seenAt = new Date();
  await message.save();

  SuccessResponse(res, { success: true, message });
};

// 5️⃣ تعليم كل الرسائل في محادثة كمقروءة
export const markAsRead = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Only admin can mark messages as read");
  const { conversationId } = req.params;
    if (!conversationId) throw new BadRequest("conversationId is required");
  const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) throw new NotFound("Conversation not found");
  if (!conversation.unread) {
    conversation.unread = { user: 0, admin: 0 };
  }
  conversation.unread.admin = 0;
  await conversation.save();

  SuccessResponse(res, { success: true, conversation });
};

// 6️⃣ حذف رسالة واحدة
export const deleteMessage = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Only admin can delete messages");
  const { messageId } = req.params;
    if (!messageId) throw new BadRequest("messageId is required");

  const message = await MessageModel.findByIdAndDelete(messageId);
  if (!message) throw new NotFound("Message not found");
  SuccessResponse(res, { success: true, message });
};

// 7️⃣ حذف محادثة كاملة
export const deleteConversation = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Only admin can delete conversations");
  const { conversationId } = req.params;
    if (!conversationId) throw new BadRequest("conversationId is required");
  const conversation = await ConversationModel.findByIdAndDelete(conversationId);
  if (!conversation) throw new NotFound("Conversation not found");
  // حذف كل الرسائل المرتبطة
  await MessageModel.deleteMany({ conversation: conversationId });

    SuccessResponse(res, { success: true, message: "Conversation and its messages deleted" });
};

