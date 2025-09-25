import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authenticated } from "../../middlewares/authenticated";
import { sendMessageByAdmin,getAdminChats,getMessagesByChatId } from "../../controller/admin/chat";

const router = Router();


router.post('/', catchAsync(sendMessageByAdmin))
router.get('/messages', catchAsync(getMessagesByChatId))
router.get('/', catchAsync(getAdminChats))

export default router;
