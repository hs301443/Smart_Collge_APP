"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const News_1 = require("../../controller/admin/News");
const express_1 = require("express");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const News_2 = require("../../validation/admin/News");
const router = (0, express_1.Router)();
router
    .get('/', (0, catchAsync_1.catchAsync)(News_1.getAllNews))
    .get('/:id', (0, catchAsync_1.catchAsync)(News_1.getNewsById))
    .post('/', (0, validation_1.validate)(News_2.createNewsSchema), (0, catchAsync_1.catchAsync)(News_1.createNews))
    .patch('/:id', (0, validation_1.validate)(News_2.updateNewsSchema), (0, catchAsync_1.catchAsync)(News_1.updateNews))
    .delete('/:id', (0, catchAsync_1.catchAsync)(News_1.deleteNews));
exports.default = router;
