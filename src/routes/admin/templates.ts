import { Router } from 'express';
import { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate } from '../../controller/admin/templates';
import { validate } from '../../middlewares/validation';
import { createTemplateSchema, updateTemplateSchema } from '../../validation/admin/templates';
import { auth, authorizeRoles} from '../../middlewares/authorized';
import { authenticated } from '../../middlewares/authenticated';

const router = Router();

router.post('/', auth, authorizeRoles("admin"), validate(createTemplateSchema), createTemplate);
router.get('/', authenticated , getTemplates);
router.get('/:id',authenticated, getTemplateById);
router.put('/:id', auth, authorizeRoles("admin"), validate(updateTemplateSchema), updateTemplate);
router.delete('/:id', auth, authorizeRoles("admin"), deleteTemplate);

export default router;