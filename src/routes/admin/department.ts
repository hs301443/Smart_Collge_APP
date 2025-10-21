import { Router } from "express";
import {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
} from "../../controller/admin/department";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router
    .get("/", catchAsync(getDepartments))
    .get("/:id", catchAsync(getDepartmentById))
    .post("/", catchAsync(createDepartment))
    .patch("/:id", catchAsync(updateDepartment))
    .delete("/:id", catchAsync(deleteDepartment));

export default router;