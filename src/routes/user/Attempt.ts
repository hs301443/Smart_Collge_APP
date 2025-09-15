import { Router } from "express";
import { authenticated } from "../../middlewares/authenticated";
import {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getMyAttempts,
} from "../../controller/users/Attempt";
import { catchAsync } from "../../utils/catchAsync";
const router = Router();

router.post("/start", authenticated, catchAsync(startAttempt));
router.post("/save-answer", authenticated, catchAsync(saveAnswer));
router.post("/submit", authenticated, catchAsync(submitAttempt));
router.get("/my-attempts", authenticated, catchAsync(getMyAttempts));

export default router;
