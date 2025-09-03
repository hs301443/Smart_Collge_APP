import { Router } from "express";
import { ConversationModel } from "../../models/shema/Conversation";
import { MessageModel } from "../../models/shema/Message";

const router = Router();


router.get("/conversations/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const conversations = await ConversationModel.find({ user: userId })
    .populate("admin", "name email")
    .sort({ lastMessageAt: -1 });

  res.json({ success: true, conversations });
});

export default router;