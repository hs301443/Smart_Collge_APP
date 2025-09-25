import { Router } from 'express';
import{sendNotificationToAll,getallNotification,deletenotification,updateNotification,getNotificationById} from '../../controller/admin/notification';
import {createnotificationSchema,updatenotificationSchema} from '../../validation/admin/notification';
import { validate } from '../../middlewares/validation';
import { authenticated } from '../../middlewares/authenticated';

const router = Router();

router.post('/',validate(createnotificationSchema),sendNotificationToAll);
router.get('/',getallNotification);
router.delete('/:id',deletenotification);
router.put('/:id',validate(updatenotificationSchema),updateNotification);
router.get('/:id',getNotificationById);

export default router;

