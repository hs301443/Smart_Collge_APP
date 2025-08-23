import { Router } from 'express';
import{sendNotificationToAll,getallNotification,deletenotification,updateNotification,getNotificationById} from '../../controller/admin/notification';
import {createnotificationSchema,updatenotificationSchema} from '../../validation/admin/notification';
import { validate } from '../../middlewares/validation';
import { authenticated } from '../../middlewares/authenticated';
import { authorizeRoles } from '../../middlewares/authorized';

const router = Router();

router.post('/',authenticated,authorizeRoles('admin'),validate(createnotificationSchema),sendNotificationToAll);
router.get('/',authenticated,authorizeRoles('admin'),getallNotification);
router.delete('/:id',authenticated,authorizeRoles('admin'),deletenotification);
router.put('/:id',authenticated,authorizeRoles('admin'),validate(updatenotificationSchema),updateNotification);
router.get('/:id',authenticated,authorizeRoles('admin'),getNotificationById);

export default router;