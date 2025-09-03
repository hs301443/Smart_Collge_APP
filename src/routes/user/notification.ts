import { Router } from "express";
import{getUserNotifications, getUnreadCount, getSingleNotification} from '../../controller/users/notification'
import { authenticated } from "../../middlewares/authenticated";
import { catchAsync } from "../../utils/catchAsync";

const router = Router()

router.get('/unread-count', authenticated, catchAsync(getUnreadCount));

router.get('/', authenticated, catchAsync(getUserNotifications));

router.get('/:id', authenticated, catchAsync(getSingleNotification));


export default router;