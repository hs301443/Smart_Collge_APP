import { Router } from "express";
import {
    getDepartments,
    getDepartmentById,
    
} from "../../controller/users/department";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router
    .get("/", catchAsync(getDepartments))
    .get("/:id", catchAsync(getDepartmentById))


export default router;