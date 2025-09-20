import { Router } from "express";
import { addToGroup, createGroup, deleteMessage, deleteRoomMessages, getAdminRooms, getRoomMessages,sendMessageAdmin ,removeFromGroup
, 
 } from "../../controller/admin/chat";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

// ✅ Admin Routes for Chat
router.get("/rooms", catchAsync(getAdminRooms));

// إنشاء جروب جديد
router.post("/rooms/group", catchAsync(createGroup));

// إضافة عضو للجروب
router.post("/rooms/group/add", catchAsync(addToGroup));

// إزالة عضو من الجروب
router.post("/rooms/group/remove", catchAsync(removeFromGroup));

// جلب كل الرسائل في روم معين
router.get("/rooms/:roomId/messages", catchAsync(getRoomMessages));

// مسح رسالة واحدة (Soft Delete)
router.delete("/messages/:messageId", catchAsync(deleteMessage));


// مسح كل الرسائل في روم (Soft Delete)
router.delete("/rooms/:roomId/messages", catchAsync(deleteRoomMessages));   // Delete room

router.post("/rooms/:roomId/messages", catchAsync(sendMessageAdmin));



export default router;
