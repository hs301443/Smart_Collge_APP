"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Questions_1 = require("../../controller/admin/Questions");
const catchAsync_1 = require("../../utils/catchAsync");
const multer_1 = require("../../utils/multer");
const router = (0, express_1.Router)();
router
    .post('/:examId', multer_1.uploadQuestionImage.single("image"), (0, catchAsync_1.catchAsync)(Questions_1.createQuestionForExam))
    .get('/:examId', (0, catchAsync_1.catchAsync)(Questions_1.getAllQuestionsforExam))
    .delete('/:id', (0, catchAsync_1.catchAsync)(Questions_1.deleteQuestionById))
    .put('/:id', (0, catchAsync_1.catchAsync)(Questions_1.updateQuestionById));
exports.default = router;
