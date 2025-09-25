import { Router } from 'express';
import { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate } from '../../controller/admin/templates';
import { validate } from '../../middlewares/validation';
import { createTemplateSchema, updateTemplateSchema } from '../../validation/admin/templates';

const router = Router();

router.post('/',  validate(createTemplateSchema), createTemplate);
router.get('/',   getTemplates);
router.get('/:id', getTemplateById);
router.put('/:id',  validate(updateTemplateSchema), updateTemplate);
router.delete('/:id',  deleteTemplate);

export default router;