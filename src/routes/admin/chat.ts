import { Router } from "express";
import {
  getAdminConversations,
  getMessages,
  markMessageAsRead,
  markAsRead,
  deleteMessage,
  deleteConversation,
  sendMessageByAdmin
} from "../../controller/admin/chat";
import { auth } from "../../middlewares/authorized";
import { catchAsync } from "../../utils/catchAsync";
const router = Router();

// المحادثات
router.get("/conversations",auth ,catchAsync(getAdminConversations));

// الرسائل
router.get("/messages/:conversationId",auth , catchAsync(getMessages));

// إرسال رسالة
router.post("/messages/send", auth ,catchAsync(sendMessageByAdmin));

// تعليم رسالة واحدة كمقروءة
router.post("/messages/read/message/:messageId",auth ,catchAsync(markMessageAsRead));

// تعليم كل الرسائل كمقروءة
router.post("/messages/read/:conversationId", auth ,catchAsync(markAsRead));

// حذف رسالة واحدة
router.delete("/messages/:messageId", auth ,catchAsync(deleteMessage));

// حذف محادثة كاملة
router.delete("/conversations/:conversationId", auth ,catchAsync(deleteConversation));

export default router;
