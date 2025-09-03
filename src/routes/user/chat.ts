import { Router } from "express";
import {
  getUserConversations,
  getUserMessages,
  sendMessageByUser,
  markUserMessageAsRead,
  markUserConversationAsRead,
  deleteUserMessage,
  deleteUserConversation,
  getUserUnreadCount
} from "../../controller/users/chats";
import { auth } from "../../middlewares/authorized";
import { catchAsync } from "../../utils/catchAsync";
import { authenticated } from "../../middlewares/authenticated";

const router = Router();

// المحادثات
router.get("/conversations", authenticated, catchAsync(getUserConversations));
router.get("/messages/:conversationId", authenticated, catchAsync(getUserMessages));

// إرسال رسالة
router.post("/messages/send", authenticated, catchAsync(sendMessageByUser));

// تعليم رسالة كمقروءة
router.post("/messages/read/message/:messageId", authenticated, catchAsync(markUserMessageAsRead));
router.post("/messages/read/:conversationId", authenticated, catchAsync(markUserConversationAsRead));

// حذف رسالة ومحادثة
router.delete("/messages/:messageId", authenticated, catchAsync(deleteUserMessage));
router.delete("/conversations/:conversationId", authenticated, catchAsync(deleteUserConversation));

// عدد الرسائل الغير مقروءة
router.get("/unread/count", authenticated, catchAsync(getUserUnreadCount));

export default router;
