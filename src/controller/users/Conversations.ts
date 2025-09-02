import { Request, Response } from "express";
import { ConversationModel } from "../../models/shema/Conversation";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";

export const getUserConversations = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("You must be logged in to access this route.");
  const userId = req.user._id;
    if (!userId) throw new BadRequest("User ID is required.");
  const conversations = await ConversationModel.find({ user: userId })
    .populate("admin", "name email")
    .sort({ updatedAt: -1 });
    if (!conversations) throw new NotFound("No conversations found for this user.");
 
    SuccessResponse(res, {"conversations": conversations} );
};
