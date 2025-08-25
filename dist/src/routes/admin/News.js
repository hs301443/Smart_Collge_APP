"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const News_1 = require("../../controller/admin/News");
const express_1 = require("express");
const catchAsync_1 = require("../../utils/catchAsync");
const authenticated_1 = require("../../middlewares/authenticated");
const validation_1 = require("../../middlewares/validation");
const News_2 = require("../../validation/admin/News");
const authorized_1 = require("../../middlewares/authorized");
const router = (0, express_1.Router)();
router
    .get('/', authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(News_1.getAllNews))
    .get('/:id', authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(News_1.getNewsById))
    .post('/', authenticated_1.authenticated, (0, authorized_1.authorizeRoles)('admin'), (0, validation_1.validate)(News_2.createNewsSchema), (0, catchAsync_1.catchAsync)(News_1.createNews))
    .patch('/:id', authenticated_1.authenticated, (0, authorized_1.authorizeRoles)('admin'), (0, validation_1.validate)(News_2.updateNewsSchema), (0, catchAsync_1.catchAsync)(News_1.updateNews))
    .delete('/:id', authenticated_1.authenticated, (0, authorized_1.authorizeRoles)('admin'), (0, catchAsync_1.catchAsync)(News_1.deleteNews));
exports.default = router;
