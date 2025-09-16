import {createNews, deleteNews, getAllNews, updateNews,getNewsById} from "../../controller/admin/News";
import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authenticated } from "../../middlewares/authenticated";
import { validate } from "../../middlewares/validation";
import { createNewsSchema, updateNewsSchema } from "../../validation/admin/News";
import { auth, authorizeRoles } from "../../middlewares/authorized";

const router = Router();

router
    .get('/',auth, catchAsync(getAllNews))
    .get('/:id',auth ,catchAsync(getNewsById))
    .post('/', auth,authorizeRoles('admin') ,validate(createNewsSchema), catchAsync(createNews))
    .patch('/:id', auth,authorizeRoles('admin') ,validate(updateNewsSchema), catchAsync(updateNews))
    .delete('/:id', auth,authorizeRoles('admin')  ,catchAsync(deleteNews));

export default router;
