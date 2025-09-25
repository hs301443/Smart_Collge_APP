import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendMessageByAdmin,getAdminChats,getMessagesByChatId } from "../../controller/admin/chat";

const router = Router();


router.post('/:chatId', catchAsync(sendMessageByAdmin))
router.get('/messages/:chatId', catchAsync(getMessagesByChatId))
router.get('/', catchAsync(getAdminChats))

export default router;
