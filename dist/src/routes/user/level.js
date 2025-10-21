"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const level_1 = require("../../controller/users/level");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
router
    .get("/", (0, catchAsync_1.catchAsync)(level_1.getLevels))
    .get("/:id", (0, catchAsync_1.catchAsync)(level_1.getLevelById));
exports.default = router;
