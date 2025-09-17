import express from "express";
import { createRoom, joinRoom,sendMessage,getMessages } from "../../controller/users/chats";
import { authenticated } from "../../middlewares/authenticated";
import { catchAsync } from "../../utils/catchAsync";

const router = express.Router();



router.post("/rooms", authenticated, catchAsync(createRoom));
router.post("/rooms/:roomId/join", authenticated,catchAsync(joinRoom));
router.post("/rooms/:roomId/messages",authenticated ,catchAsync(sendMessage));
router.get("/rooms/:roomId/messages",authenticated ,catchAsync(getMessages));

export default router;
