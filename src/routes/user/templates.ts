import { Router } from 'express';
import {  getTemplates, getTemplateById,  } from '../../controller/users/templates';

import { authenticated } from '../../middlewares/authenticated';

const router = Router();

router.get('/', authenticated , getTemplates);
router.get('/:id',authenticated, getTemplateById);
export default router;