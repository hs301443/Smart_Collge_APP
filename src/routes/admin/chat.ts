import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authenticated } from "../../middlewares/authenticated";
import { sendMessageByAdmin,getAdminChats,getMessagesByChatId } from "../../controller/admin/chat";

const router = Router();


router.post('/',authenticated, catchAsync(sendMessageByAdmin))
router.get('/messages',authenticated, catchAsync(getMessagesByChatId))
router.get('/',authenticated, catchAsync(getAdminChats))

export default router;
