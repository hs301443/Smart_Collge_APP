"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/adminAttemptRoutes.ts
const express_1 = require("express");
const Attempt_1 = require("../../controller/admin/Attempt");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// ✅ get all attempts for an exam
router.get("/:examId", (0, catchAsync_1.catchAsync)(Attempt_1.getAttemptsByExam));
// ✅ get all attempts for a student
router.get("/student/:studentId", (0, catchAsync_1.catchAsync)(Attempt_1.getAttemptsByStudent));
// ✅ get single attempt by id
router.get("/:id", (0, catchAsync_1.catchAsync)(Attempt_1.getAttemptById));
// ✅ manual grading
router.put("/:id/grade", (0, catchAsync_1.catchAsync)(Attempt_1.gradeAttempts));
// ✅ reset attempt (reopen exam)
router.post("/:id/reset", (0, catchAsync_1.catchAsync)(Attempt_1.resetAttempt));
// ✅ delete attempt
router.delete("/:id", (0, catchAsync_1.catchAsync)(Attempt_1.deleteAttempt));
exports.default = router;
