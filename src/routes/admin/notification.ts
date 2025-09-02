import { Router } from 'express';
import{sendNotificationToAll,getallNotification,deletenotification,updateNotification,getNotificationById} from '../../controller/admin/notification';
import {createnotificationSchema,updatenotificationSchema} from '../../validation/admin/notification';
import { validate } from '../../middlewares/validation';
import { authenticated } from '../../middlewares/authenticated';
import { auth, authorizeRoles } from '../../middlewares/authorized';
const router = Router();

router.post('/',auth, authorizeRoles("superAdmin"),validate(createnotificationSchema),sendNotificationToAll);
router.get('/',auth, authorizeRoles("superAdmin"),getallNotification);
router.delete('/:id',auth, authorizeRoles("superAdmin"),deletenotification);
router.put('/:id',auth, authorizeRoles("superAdmin"),validate(updatenotificationSchema),updateNotification);
router.get('/:id',auth, authorizeRoles("superAdmin"),getNotificationById);

export default router;