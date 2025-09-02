
import e, { Request, Response } from "express";
import { ConversationModel } from "../../models/shema/Conversation";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";
import { MessageModel } from "../../models/shema/Message";

 export const sendUserMessage = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("You must be logged in to access this route.");
  const userId = req.user._id;
  const { adminId, text } = req.body;
    if (!userId || !adminId || !text) throw new BadRequest("User ID, Admin ID, and text are required.");
    
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
  if (!conversation.unread) {
    conversation.unread = { admin: 0, user: 0 };
  }
  conversation.unread.admin += 1;
  await conversation.save();

    SuccessResponse(res, {"message": message} );
};

export const getUserMessages = async (req: Request, res: Response) => {
     if (!req.user) throw new UnauthorizedError("You must be logged in to access this route.");
    const userId = req.user._id;
    const { adminId } = req.params;
    if (!userId || !adminId) throw new BadRequest("User ID and Admin ID are required.");
    const conversation = await ConversationModel.findOne({ user: userId, admin: adminId });
    if (!conversation) throw new NotFound("Conversation not found.");
    const messages = await MessageModel.find({ conversation: conversation._id }).sort({ createdAt: 1 });

    // Mark messages as seen
    await MessageModel.updateMany(
        { conversation: conversation._id, to: userId, seenAt: { $exists: false } },
        { $set: { seenAt: new Date() } }
    );    
    if (conversation.unread) {
        conversation.unread.user = 0;
        await conversation.save();
    }

    SuccessResponse(res, {"messages": messages} );
    
}

export const getUserMessagesById = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("You must be logged in to access this route.");

  const userId = req.user._id;

  const conversations = await ConversationModel.find({ user: userId })
    .populate("admin", "name email")
    .sort({ updatedAt: -1 })
    .lean(); // بيرجع object عادي مش mongoose doc

  if (conversations.length === 0) {
    throw new NotFound("No conversations found for this user.");
  }

  // رجع unread count بشكل صريح
  const mapped = conversations.map((conv) => ({
    _id: conv._id,
    admin: conv.admin,
    updatedAt: conv.updatedAt,
    lastMessage: conv.lastMessageAt || null, // لو عايز تجيب آخر رسالة
    unread: conv.unread?.user ?? 0,       // unread خاص بالـ user
  }));

  return SuccessResponse(res, { conversations: mapped });
};

export const updateusermess