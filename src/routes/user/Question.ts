import { Router } from "express";
import { authenticated } from "../../middlewares/authenticated";
import { getQuestionsForExam, getQuestionByIdForStudent,getQuestionByIndex } from "../../controller/users/Question";
import { catchAsync } from "../../utils/catchAsync";
const router = Router();

// ✅ كل أسئلة الامتحان
router.get("/:examId", authenticated, catchAsync(getQuestionsForExam));

// ✅ سؤال واحد بس
router.get("/:examId/:questionId", authenticated, catchAsync(getQuestionByIdForStudent));

// Get question by index (next/prev)
router.get("/:examId/:index", authenticated, catchAsync(getQuestionByIndex));

export default router;
