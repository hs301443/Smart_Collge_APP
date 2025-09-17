import { Router } from "express";
import {
  adminCreateRoom,
  adminJoinRoom,
  adminSendMessage,
  adminDeleteMessage,
  adminDeleteRoom,
} from "../../controller/admin/chat";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

// ✅ Admin Routes for Chat
router.post("/rooms", catchAsync(adminCreateRoom));             // Create room
router.post("/rooms/:roomId/join", catchAsync(adminJoinRoom));  // Join room
router.post("/rooms/:roomId/messages", catchAsync(adminSendMessage)); // Send message
router.delete("/messages/:messageId", catchAsync(adminDeleteMessage)); // Delete message
router.delete("/rooms/:roomId", catchAsync(adminDeleteRoom));   // Delete room

export default router;
