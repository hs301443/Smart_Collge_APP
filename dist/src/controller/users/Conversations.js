"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserConversations = void 0;
const Conversation_1 = require("../../models/shema/Conversation");
const Errors_1 = require("../../Errors");
const Errors_2 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
const getUserConversations = async (req, res) => {
    if (!req.user)
        throw new Errors_2.UnauthorizedError("You must be logged in to access this route.");
    const userId = req.user._id;
    if (!userId)
        throw new BadRequest_1.BadRequest("User ID is required.");
    const conversations = await Conversation_1.ConversationModel.find({ user: userId })
        .populate("admin", "name email")
        .sort({ updatedAt: -1 });
    if (!conversations)
        throw new Errors_1.NotFound("No conversations found for this user.");
    (0, response_1.SuccessResponse)(res, { "conversations": conversations });
};
exports.getUserConversations = getUserConversations;
