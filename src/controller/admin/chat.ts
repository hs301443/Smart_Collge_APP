import { Request, Response } from "express";
import { ConversationModel } from "../../models/shema/Conversation";
import { MessageModel } from "../../models/shema/Message";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { getIO } from "../../utils/chatSocket";

// 1️⃣ كل المحادثات الخاصة بإدمن

export const getAdminConversations = async (req: Request, res: Response) => {
 if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  }    const adminId = req.user?.id; // مفروض الأدمن بيكون لوج إن وداخل بالتوكن\

    const conversations = await ConversationModel.find({ admin: adminId })
      .populate("user", "name email") // عرض بيانات اليوزر
      .sort({ updatedAt: -1 });
        if(!conversations) throw new NotFound("No conversations found");

    SuccessResponse(res, { success: true, conversations });
  };

// 2️⃣ كل الرسائل في محادثة معينة
export const getMessages = async (req: Request, res: Response) => {
 if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  }  const { conversationId } = req.params;
  if (!conversationId) throw new BadRequest("conversationId is required");
  const messages = await MessageModel.find({ conversation: conversationId }).sort({ createdAt: 1 });
    if(!messages) throw new NotFound("No messages found"); 
        SuccessResponse(res, { success: true, messages });
};

// 3️⃣ إرسال رسالة
export const sendMessageByAdmin = async (req: Request, res: Response) => {
   if (!req.user || !req.user.isSuperAdmin) {
      throw new UnauthorizedError("Only Super Admin can create roles");
    }
  const { adminId, userId, text } = req.body;

  let conversation = await ConversationModel.findOne({ admin: adminId, user: userId });

  if (!conversation) {
    conversation = await ConversationModel.create({
      admin: adminId,
      user: userId,
    });
  }

  const message = await MessageModel.create({
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
  const io = getIO();
  io.to(userId).emit("receiveMessage", message); // تبعت للـ user
  io.to(adminId).emit("messageSent", message);   // تبعت للـ admin نفسه

  return SuccessResponse(res, { conversation, message });
};
// 4️⃣ تعليم رسالة واحدة كمقروءة
export const markMessageAsRead = async (req: Request, res: Response) => {
 if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  }  const { messageId } = req.params;

  if (!messageId) throw new BadRequest("messageId is required");

  const message = await MessageModel.findById(messageId);
  if (!message) throw new NotFound("Message not found");

  message.seenAt = new Date();
  await message.save();

  // 🔥 ريل تايم
  const io = getIO();
  io.to(message.from.toString()).emit("messageRead", message);

  SuccessResponse(res, { success: true, message });
};

// 5️⃣ تعليم كل الرسائل في محادثة كمقروءة
export const markAsRead = async (req: Request, res: Response) => {
 if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  }  const { conversationId } = req.params;
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
 if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  }  const { messageId } = req.params;

  if (!messageId) throw new BadRequest("messageId is required");

  const message = await MessageModel.findByIdAndDelete(messageId);
  if (!message) throw new NotFound("Message not found");

  // 🔥 ريل تايم
  const io = getIO();
  io.to(message.to.toString()).emit("messageDeleted", messageId);

  SuccessResponse(res, { success: true, message });
};

// 7️⃣ حذف محادثة كاملة
export const deleteConversation = async (req: Request, res: Response) => {
 if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  }  const { conversationId } = req.params;

  if (!conversationId) throw new BadRequest("conversationId is required");

  const conversation = await ConversationModel.findByIdAndDelete(conversationId);
  if (!conversation) throw new NotFound("Conversation not found");

  await MessageModel.deleteMany({ conversation: conversationId });

  // 🔥 ريل تايم
  const io = getIO();
  io.to(conversation.user.toString()).emit("conversationDeleted", conversationId);

  SuccessResponse(res, { success: true, message: "Conversation and its messages deleted" });
};
// ✅ محادثة واحدة
export const getConversation = async (req: Request, res: Response) => {
 if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  }
  const { conversationId } = req.params;
  if (!conversationId) throw new BadRequest("conversationId is required");

  const conversation = await ConversationModel.findById(conversationId)
    .populate("user", "name email")
    .populate("admin", "name email");

  if (!conversation) throw new NotFound("Conversation not found");

  return SuccessResponse(res, { conversation });
};

// ✅ عدد الرسائل الغير مقروءة للأدمن
export const getUnreadCount = async (req: Request, res: Response) => {
 if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  }
  const adminId = req.user.id;

  const conversations = await ConversationModel.find({ admin: adminId });

  const totalUnread = conversations.reduce((sum, conv) => {
    return sum + (conv.unread?.admin || 0);
  }, 0);

  return SuccessResponse(res, { unread: totalUnread });
};
