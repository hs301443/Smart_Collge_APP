"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Conversation_1 = require("../../models/shema/Conversation");
const router = (0, express_1.Router)();
router.get("/conversations/user/:userId", async (req, res) => {
    const { userId } = req.params;
    const conversations = await Conversation_1.ConversationModel.find({ user: userId })
        .populate("admin", "name email")
        .sort({ lastMessageAt: -1 });
    res.json({ success: true, conversations });
});
exports.default = router;
