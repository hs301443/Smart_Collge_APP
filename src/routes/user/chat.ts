import express from "express";
import { createRoom, deleteMessage, deleteRoom, getRoomMessages, getUserRooms,sendMessage, } from "../../controller/users/chats";
import { authenticated } from "../../middlewares/authenticated";
import { catchAsync } from "../../utils/catchAsync";

const router = express.Router();



router.get("/rooms",authenticated ,catchAsync(getUserRooms));

// إنشاء روم جديد
router.post("/rooms", authenticated, catchAsync(createRoom));

// جلب كل الرسائل في روم
router.get("/:roomId/messages",authenticated, catchAsync(getRoomMessages));

// إرسال رسالة في روم
router.post("/rooms/:roomId/messages", authenticated, catchAsync(sendMessage));

// حذف رسالة (soft delete)
router.delete("/messages/:messageId", authenticated, catchAsync(deleteMessage));

// حذف روم (soft delete)
router.delete("/rooms/:roomId", authenticated, catchAsync(deleteRoom));


export default router;
