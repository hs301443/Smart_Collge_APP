"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catchAsync_1 = require("../../utils/catchAsync");
const Exam_1 = require("../../controller/users/Exam");
const authenticated_1 = require("../../middlewares/authenticated");
const router = (0, express_1.Router)();
router.get("/exams", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(Exam_1.getExamsForStudent));
// ✅ جلب امتحان معين
router.get("/exams/:id", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(Exam_1.getExamByIdForStudent));
// ✅ جلب كل أسئلة امتحان معين بدون الإجابات الصحيحة
router.get("/exams/:examId/questions", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(Exam_1.getQuestionsForExam));
// ✅ بدء Attempt جديد
router.post("/attempt/start", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(Exam_1.startAttempt));
// ✅ حفظ إجابة أثناء Attempt
router.post("/attempt/save-answer", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(Exam_1.saveAnswer));
// ✅ تقديم Attempt (Submit)
router.post("/attempt/submit", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(Exam_1.submitAttempt));
// ✅ جلب كل محاولات الطالب
router.get("/attempts", authenticated_1.authenticated, (0, catchAsync_1.catchAsync)(Exam_1.getMyAttempts));
exports.default = router;
