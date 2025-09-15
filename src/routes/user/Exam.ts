import { catchAsync } from "../../utils/catchAsync";
import { authenticated } from "../../middlewares/authenticated";
import { Router } from "express";
import { getExamByIdForStudent,getExamsForStudent  } from "../../controller/users/Exam";

const router = Router();

router.get("/", authenticated, catchAsync(getExamsForStudent));
router.get("/:id", authenticated, catchAsync(getExamByIdForStudent));


export default router;