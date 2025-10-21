import { Router } from "express";
import {createlevel,getLevelById,getLevels,deleteLevel,updateLevel} from "../../controller/admin/level"
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router
    .get("/", catchAsync(getLevels))
    .get("/:id", catchAsync(getLevelById))
    .post("/", catchAsync(createlevel))
    .patch("/:id", catchAsync(updateLevel))
    .delete("/:id", catchAsync(deleteLevel));

export default router;