import express from "express";
import { createRoom, getRooms, joinRoom, getRoomMessages } from "../../controller/users/chats";
import { validate } from "../../middlewares/validation";
import { authenticated } from "../../middlewares/authenticated";
import { catchAsync } from "../../utils/catchAsync";

const router = express.Router();



router.post("/", authenticated, catchAsync(createRoom));
router.get("/", authenticated,catchAsync(getRooms));
router.post("/:roomId/join",authenticated ,catchAsync(joinRoom));
router.get("/:roomId/messages",authenticated ,catchAsync(getRoomMessages));

export default router;
