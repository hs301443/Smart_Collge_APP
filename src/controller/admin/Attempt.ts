// controller/admin/Attempt.ts
import { Request, Response } from "express";
import { AttemptModel } from "../../models/shema/Attempt";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

// ✅ جلب كل المحاولات
export const getAllAttempts = async (req: Request, res: Response) => {
  const attempts = await AttemptModel.find()
    .populate("student", "name email")
    .populate("exam", "title subject_name level department");
  SuccessResponse(res, { attempts }, 200);
};

// ✅ جلب محاولات امتحان معين
export const getAttemptsByExam = async (req: Request, res: Response) => {
  const attempts = await AttemptModel.find({ exam: req.params.examId })
    .populate("student", "name email")
    .populate("exam", "title subject_name");
  SuccessResponse(res, { attempts }, 200);
};

// ✅ جلب محاولات طالب معين
export const getAttemptsByStudent = async (req: Request, res: Response) => {
  const attempts = await AttemptModel.find({ student: req.params.studentId })
    .populate("exam", "title subject_name level department");
  SuccessResponse(res, { attempts }, 200);
};

// ✅ تعديل Attempt (مثلاً تغيير status أو totalPoints)
export const updateAttempt = async (req: Request, res: Response) => {
  const attempt = await AttemptModel.findByIdAndUpdate(req.params.attemptId, req.body, { new: true });
  if (!attempt) throw new NotFound("Attempt not found");
  SuccessResponse(res, { attempt }, 200);
};

// ✅ حذف Attempt
export const deleteAttempt = async (req: Request, res: Response) => {
  const attempt = await AttemptModel.findByIdAndDelete(req.params.attemptId);
  if (!attempt) throw new NotFound("Attempt not found");
  SuccessResponse(res, { message: "Attempt deleted successfully" }, 200);
};
