"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/admin/Attempt.ts
const express_1 = require("express");
const Attempt_1 = require("../../controller/admin/Attempt");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// كل المسارات محمية للمشرفين فقط
// ✅ جلب كل المحاولات
router.get("/", (0, catchAsync_1.catchAsync)(Attempt_1.getAllAttempts));
// ✅ جلب محاولات امتحان معين
router.get("/exam/:examId", (0, catchAsync_1.catchAsync)(Attempt_1.getAttemptsByExam));
// ✅ جلب محاولات طالب معين
router.get("/student/:studentId", (0, catchAsync_1.catchAsync)(Attempt_1.getAttemptsByStudent));
// ✅ تعديل Attempt (مثلاً تعديل النتيجة أو حالة التسليم)
router.put("/:attemptId", (0, catchAsync_1.catchAsync)(Attempt_1.updateAttempt));
// ✅ حذف Attempt
router.delete("/:attemptId", (0, catchAsync_1.catchAsync)(Attempt_1.deleteAttempt));
exports.default = router;
