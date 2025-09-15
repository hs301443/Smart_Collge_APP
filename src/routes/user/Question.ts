import { Router } from "express";
import { authenticated } from "../../middlewares/authenticated";
import { getQuestionsForExam, getQuestionByIdForStudent } from "../../controller/users/Question";
import { catchAsync } from "../../utils/catchAsync";
const router = Router();

router.get("/:examId", authenticated, catchAsync(getQuestionsForExam));

router.get("/:examId/:questionId", authenticated, catchAsync(getQuestionByIdForStudent));

export default router;
