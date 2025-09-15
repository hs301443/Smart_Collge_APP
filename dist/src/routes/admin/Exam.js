"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Exam_1 = require("../../controller/admin/Exam");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
router
    .post('/', (0, catchAsync_1.catchAsync)(Exam_1.createExam))
    .get('/', (0, catchAsync_1.catchAsync)(Exam_1.getAllExams))
    .get('/:id', (0, catchAsync_1.catchAsync)(Exam_1.getExamById))
    .delete('/:id', (0, catchAsync_1.catchAsync)(Exam_1.deleteExam))
    .put('/:id', (0, catchAsync_1.catchAsync)(Exam_1.updateExam));
exports.default = router;
