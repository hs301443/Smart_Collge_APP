// routes/admin/Attempt.ts
import { Router } from "express";
import { getAllAttempts, getAttemptsByExam, getAttemptsByStudent, updateAttempt, deleteAttempt } from "../../controller/admin/Attempt";
import { catchAsync } from "../../utils/catchAsync";
const router = Router();

// كل المسارات محمية للمشرفين فقط

// ✅ جلب كل المحاولات
router.get("/", catchAsync(getAllAttempts));

// ✅ جلب محاولات امتحان معين
router.get("/exam/:examId", catchAsync(getAttemptsByExam));

// ✅ جلب محاولات طالب معين
router.get("/student/:studentId", catchAsync(getAttemptsByStudent));

// ✅ تعديل Attempt (مثلاً تعديل النتيجة أو حالة التسليم)
router.put("/:attemptId", catchAsync(updateAttempt));

// ✅ حذف Attempt
router.delete("/:attemptId", catchAsync(deleteAttempt));

export default router;
