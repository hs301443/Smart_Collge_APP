"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_1 = require("../../controller/users/department");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
router
    .get("/", (0, catchAsync_1.catchAsync)(department_1.getDepartments))
    .get("/:id", (0, catchAsync_1.catchAsync)(department_1.getDepartmentById));
exports.default = router;
