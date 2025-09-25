import { Request, Response } from "express";
import { MessageModel } from "../../models/shema/Message";
import { ChatModel } from "../../models/shema/chat";
import { verifyToken } from "../../utils/auth";
import { UnauthorizedError, NotFound} from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";

export const sendMessage = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new UnauthorizedError("No token provided");

  const decoded: any = verifyToken(token);

  // 🛑 السماح لليوزر فقط
  if (!(decoded.userType === "Student" || decoded.userType === "Graduated")) {
    throw new UnauthorizedError("Only users can send messages");
  }

  const { content } = req.body;
  if (!content) throw new BadRequest("Message content is required");

  // 🔎 نجيب أو نعمل شات واحد بين اليوزر والادمن
  let chat = await ChatModel.findOne({ user: decoded.id });
  if (!chat) {
    chat = await ChatModel.create({
      user: decoded.id,
      admin: "ADMIN_ID" // 👈 تحط هنا الـ id بتاع الادمن
    });
  }

  const msg = await MessageModel.create({
    chat: chat._id,
    senderModel: "User",
    sender: decoded.id,
    content,
    readBy: [decoded.id],
  });

  SuccessResponse(res, msg);
};

export const getMessages = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new UnauthorizedError("No token provided");

  const decoded: any = verifyToken(token);

  if (!(decoded.userType === "Student" || decoded.userType === "Graduated")) {
    throw new UnauthorizedError("Only users can get messages");
  }

  const chat = await ChatModel.findOne({ user: decoded.id });
  if (!chat) throw new NotFound("Chat not found");

  const messages = await MessageModel.find({ chat: chat._id })
    .sort({ createdAt: 1 })
    .populate("sender");

  SuccessResponse(res, messages);
};
