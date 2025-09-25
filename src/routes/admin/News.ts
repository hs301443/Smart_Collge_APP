import {createNews, deleteNews, getAllNews, updateNews,getNewsById} from "../../controller/admin/News";
import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authenticated } from "../../middlewares/authenticated";
import { validate } from "../../middlewares/validation";
import { createNewsSchema, updateNewsSchema } from "../../validation/admin/News";

const router = Router();

router
    .get('/', catchAsync(getAllNews))
    .get('/:id' ,catchAsync(getNewsById))
    .post('/',validate(createNewsSchema), catchAsync(createNews))
    .patch('/:id', validate(updateNewsSchema), catchAsync(updateNews))
    .delete('/:id'  ,catchAsync(deleteNews));

export default router;
