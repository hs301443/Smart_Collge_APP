import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { getExamsForStudent, getExamByIdForStudent, getQuestionsForExam, startAttempt, saveAnswer, submitAttempt, getMyAttempts } from "../../controller/users/Exam";
import { authenticated } from "../../middlewares/authenticated";
const router = Router();
router.get("/exams",  authenticated, catchAsync(getExamsForStudent));

// ✅ جلب امتحان معين
router.get("/exams/:id",authenticated,catchAsync( getExamByIdForStudent));

// ✅ جلب كل أسئلة امتحان معين بدون الإجابات الصحيحة
router.get("/exams/:examId/questions",authenticated ,catchAsync(getQuestionsForExam));

// ✅ بدء Attempt جديد
router.post("/attempt/start", authenticated,catchAsync(startAttempt));

// ✅ حفظ إجابة أثناء Attempt
router.post("/attempt/save-answer", authenticated,catchAsync(saveAnswer));

// ✅ تقديم Attempt (Submit)
router.post("/attempt/submit", authenticated,catchAsync(submitAttempt));

// ✅ جلب كل محاولات الطالب
router.get("/attempts", authenticated,catchAsync(getMyAttempts));

export default router;