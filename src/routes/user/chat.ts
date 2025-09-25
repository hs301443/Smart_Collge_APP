import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authenticated } from "../../middlewares/authenticated";
import {sendMessage,getMessages}from "../../controller/users/chats";
const router = Router();


router.post('/',authenticated, catchAsync(sendMessage))
router.get('/messages',authenticated, catchAsync(getMessages))

export default router;