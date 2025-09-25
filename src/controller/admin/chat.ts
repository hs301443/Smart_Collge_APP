import { Request, Response } from "express";
import { MessageModel } from "../../models/shema/Message";
import { ChatModel } from "../../models/shema/chat";
import { verifyToken } from "../../utils/auth";
import { UnauthorizedError, NotFound } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";

// 📨 إرسال رسالة من الأدمن
export const sendMessageByAdmin = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new UnauthorizedError("No token provided");

  const decoded: any = verifyToken(token);

  if (!(decoded.userType === "Admin" || decoded.userType === "SuperAdmin")) {
    throw new UnauthorizedError("Only admins can send messages");
  }

  const { chatId } = req.params;
  const { content } = req.body;

  if (!content) throw new BadRequest("Message content is required");

  const chat = await ChatModel.findById(chatId);
  if (!chat) throw new NotFound("Chat not found");

  const msg = await MessageModel.create({
    chat: chatId,
    senderModel: "Admin",
    sender: decoded.id,
    content,
    readBy: [decoded.id],
  });

 SuccessResponse(res, msg);
};

// 📩 جلب كل الشاتات الخاصة بالأدمن
export const getAdminChats = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new UnauthorizedError("No token provided");

  const decoded: any = verifyToken(token);

  if (!(decoded.userType === "Admin" || decoded.userType === "SuperAdmin")) {
    throw new UnauthorizedError("Only admins can view chats");
  }

  const chats = await ChatModel.find({ admin: decoded.id })
    .populate("user", "name email role")
    .sort({ updatedAt: -1 });

 SuccessResponse(res, chats);
};

// 📜 جلب الرسائل لشات محدد
export const getMessagesByChatId = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new UnauthorizedError("No token provided");

  const decoded: any = verifyToken(token);

  if (!(decoded.userType === "Admin" || decoded.userType === "SuperAdmin")) {
    throw new UnauthorizedError("Only admins can view messages");
  }

  const { chatId } = req.params;

  const chat = await ChatModel.findById(chatId);
  if (!chat) throw new NotFound("Chat not found");

  const messages = await MessageModel.find({ chat: chatId }).sort({ createdAt: 1 });

 SuccessResponse(res, messages);
};
