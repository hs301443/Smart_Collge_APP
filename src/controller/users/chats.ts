import { Request, Response } from "express";
import { MessageModel } from "../../models/shema/Message";
import { ChatModel } from "../../models/shema/chat";
import { verifyToken } from "../../utils/auth";
import { UnauthorizedError, NotFound} from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";

// 📨 إرسال رسالة جديدة (User فقط)
export const sendMessage = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new UnauthorizedError("No token provided");

  const decoded: any = verifyToken(token);
  const { chatId } = req.params;
  const { content } = req.body;

  if (!content) throw new BadRequest("Message content is required");

  // 🛑 السماح لليوزر فقط
  if (!(decoded.userType === "Student" || decoded.userType === "Graduated")) {
    throw new UnauthorizedError("Only users can send messages");
  }

  const chat = await ChatModel.findById(chatId);
  if (!chat) throw new NotFound("Chat not found");

  const msg = await MessageModel.create({
    chat: chatId,
    senderModel: "User", // 👈 دايمًا User
    sender: decoded.id,
    content,
    readBy: [decoded.id],
  });

 SuccessResponse(res, msg);
};

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;
if (!chatId) throw new BadRequest("Chat id is required");
  const chat = await ChatModel.findById(chatId);
  if (!chat) throw new NotFound("Chat not found");

  const messages = await MessageModel.find({ chat: chatId })
    .sort({ createdAt: 1 })
    .populate("sender");

  SuccessResponse(res, messages);
};