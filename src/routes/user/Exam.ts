import { catchAsync } from "../../utils/catchAsync";
import { authenticated } from "../../middlewares/authenticated";
import { Router } from "express";
import { getExamByIdForStudent,getExamsForStudent,getMyAttempts,submitExamAttempt,startExamAttempt  } from "../../controller/users/Exam";

const router = Router();

router.get("/exams", authenticated, catchAsync(getExamsForStudent));
router.get("/exam/:id", authenticated, catchAsync(getExamByIdForStudent));
router.get("/attempts", authenticated, catchAsync(getMyAttempts));
router.post("/attempt/:id/start", authenticated, catchAsync(startExamAttempt));
router.post("/attempt/:id/submit", authenticated, catchAsync(submitExamAttempt));

export default router;