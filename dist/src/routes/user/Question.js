"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticated_1 = require("../../middlewares/authenticated");
const Question_1 = require("../../controller/users/Question");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// ✅ كل أسئلة الامتحان
router.get("/:examId", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(Question_1.getQuestionsForExam));
// ✅ سؤال واحد بس
router.get("/:examId/:questionId", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(Question_1.getQuestionByIdForExam));
exports.default = router;
