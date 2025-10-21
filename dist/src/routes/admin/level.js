"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const level_1 = require("../../controller/admin/level");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
router
    .get("/", (0, catchAsync_1.catchAsync)(level_1.getLevels))
    .get("/:id", (0, catchAsync_1.catchAsync)(level_1.getLevelById))
    .post("/", (0, catchAsync_1.catchAsync)(level_1.createlevel))
    .patch("/:id", (0, catchAsync_1.catchAsync)(level_1.updateLevel))
    .delete("/:id", (0, catchAsync_1.catchAsync)(level_1.deleteLevel));
exports.default = router;
