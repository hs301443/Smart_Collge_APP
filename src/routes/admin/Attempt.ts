// routes/adminAttemptRoutes.ts
import { Router } from "express";
import {
  getAttemptsByExam,
  getAttemptsByStudent,
  getAttemptById,
  gradeAttempts,
  resetAttempt,
  deleteAttempt
} from "../../controller/admin/Attempt";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();
// ✅ get all attempts for an exam
router.get("/:examId", catchAsync(getAttemptsByExam));

// ✅ get all attempts for a student
router.get("/student/:studentId", catchAsync(getAttemptsByStudent));

// ✅ get single attempt by id
router.get("/:id", catchAsync(getAttemptById));

// ✅ manual grading
router.put("/:id/grade", catchAsync(gradeAttempts));

// ✅ reset attempt (reopen exam)
router.post("/:id/reset", catchAsync(resetAttempt));

// ✅ delete attempt
router.delete("/:id", catchAsync(deleteAttempt));
export default router;
