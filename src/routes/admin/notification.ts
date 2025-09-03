import { Router } from 'express';
import{sendNotificationToAll,getallNotification,deletenotification,updateNotification,getNotificationById} from '../../controller/admin/notification';
import {createnotificationSchema,updatenotificationSchema} from '../../validation/admin/notification';
import { validate } from '../../middlewares/validation';
import { authenticated } from '../../middlewares/authenticated';
import { auth, authorizeRoles,authorizePermissions } from '../../middlewares/authorized';

const router = Router();

router.post('/',auth, authorizePermissions("sendNotificationToAll"),validate(createnotificationSchema),sendNotificationToAll);
router.get('/',auth, authorizeRoles("Admin"),getallNotification);
router.delete('/:id',auth, authorizeRoles("Admin"),deletenotification);
router.put('/:id',auth, authorizeRoles("Admin"),validate(updatenotificationSchema),updateNotification);
router.get('/:id',auth, authorizeRoles("Admin"),getNotificationById);

export default router;

