import {getallNews, getNewsById} from "../../controller/users/News";
import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authenticated } from "../../middlewares/authenticated";
import { getAllNews } from "../../controller/admin/News";

const router = Router();

router
    .get('/',authenticated, catchAsync(getAllNews))
    .get('/:id',authenticated ,catchAsync(getNewsById))


export default router;