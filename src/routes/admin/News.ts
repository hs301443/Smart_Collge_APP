import {createNews, deleteNews, getAllNews, updateNews,getNewsById} from "../../controller/admin/News";
import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authenticated } from "../../middlewares/authenticated";
import { validate } from "../../middlewares/validation";
import { createNewsSchema, updateNewsSchema } from "../../validation/admin/News";
import { authorizeRoles } from "../../middlewares/authorized";
const router = Router();

router
    .get('/',authenticated, catchAsync(getAllNews))
    .get('/:id',authenticated ,catchAsync(getNewsById))
    .post('/', authenticated,authorizeRoles('admin') ,validate(createNewsSchema), catchAsync(createNews))
    .patch('/:id', authenticated,authorizeRoles('admin') ,validate(updateNewsSchema), catchAsync(updateNews))
    .delete('/:id', authenticated,authorizeRoles('admin')  ,catchAsync(deleteNews));

export default router;
