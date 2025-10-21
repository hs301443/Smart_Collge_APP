import { Router } from "express";
import {getLevelById,getLevels} from "../../controller/users/level"
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router
    .get("/", catchAsync(getLevels))
    .get("/:id", catchAsync(getLevelById))


export default router;