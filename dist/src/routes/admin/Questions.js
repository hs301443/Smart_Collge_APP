"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Questions_1 = require("../../controller/admin/Questions");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
router
    .post('/:id', (0, catchAsync_1.catchAsync)(Questions_1.createQuestionforExam))
    .get('/:id', (0, catchAsync_1.catchAsync)(Questions_1.getAllQuestionsforExam))
    .get('/:id', (0, catchAsync_1.catchAsync)(Questions_1.getAllQuestionById))
    .delete('/:id', (0, catchAsync_1.catchAsync)(Questions_1.deleteQuestionById))
    .put('/:id', (0, catchAsync_1.catchAsync)(Questions_1.updateQuestionById));
exports.default = router;
