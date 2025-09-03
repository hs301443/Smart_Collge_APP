import { Router } from "express";
import {
  getConversations,
  getMessages,
  markMessageAsRead,
  markAsRead,
  deleteMessage,
  deleteConversation,
  sendMessageByAdmin
} from "../../controller/admin/chat";
import { auth } from "../../middlewares/authorized";

const router = Router();

// المحادثات
router.get("/conversations/:adminId",auth ,getConversations);

// الرسائل
router.get("/messages/:conversationId",auth , getMessages);

// إرسال رسالة
router.post("/messages/send/:conversationId", auth ,sendMessageByAdmin);

// تعليم رسالة واحدة كمقروءة
router.post("/messages/read/message/:messageId",auth , markMessageAsRead);

// تعليم كل الرسائل كمقروءة
router.post("/messages/read/:conversationId", auth ,markAsRead);

// حذف رسالة واحدة
router.delete("/messages/:messageId", auth ,deleteMessage);

// حذف محادثة كاملة
router.delete("/conversations/:conversationId", auth ,deleteConversation);

export default router;
