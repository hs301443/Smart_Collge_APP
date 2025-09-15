import { Request, Response } from "express";
import { AttemptModel } from "../../models/shema/Attempt";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

// Get all attempts for an exam
export const getAttemptsByExam = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin)
    throw new UnauthorizedError("Only Super Admin can perform this action");

  const { examId } = req.params;
  if (!examId) throw new BadRequest("examId is required");

  const attempts = await AttemptModel.find({ exam: examId })
    .populate("student", "name email")
    .populate("exam", "title");
  SuccessResponse(res, { attempts }, 200);
};

// Get all attempts for a student
export const getAttemptsByStudent = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin)
    throw new UnauthorizedError("Only Super Admin can perform this action");

  const { studentId } = req.params;
  if (!studentId) throw new BadRequest("studentId is required");

  const attempts = await AttemptModel.find({ student: studentId })
    .populate("exam", "title")
    .populate("student", "name email");
  SuccessResponse(res, { attempts }, 200);
};

// Get single attempt by ID
export const getAttemptById = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin)
    throw new UnauthorizedError("Only Super Admin can perform this action");

  const { id } = req.params;
  if (!id) throw new BadRequest("id is required");

  const attempt = await AttemptModel.findById(id)
    .populate("exam", "title")
    .populate("student", "name email")
    .populate("answers.question", "text type");
  if (!attempt) throw new NotFound("Attempt not found");

  SuccessResponse(res, { attempt }, 200);
};

// Manual grading
export const gradeAttempts = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin)
    throw new UnauthorizedError("Only Super Admin can perform this action");

  const { id } = req.params;
  const { answers } = req.body; // [{questionId, pointsAwarded}]
  if (!id) throw new BadRequest("id is required");

  const attempt = await AttemptModel.findById(id);
  if (!attempt) throw new NotFound("Attempt not found");

  // Update answers grading
  answers.forEach((gradedAnswer: any) => {
    const answer = attempt.answers.find(
      (a: any) => a.question.toString() === gradedAnswer.questionId
    );
    if (answer) {
      answer.pointsAwarded = gradedAnswer.pointsAwarded;
    }
  });

  // Recalculate total points
  attempt.totalPoints = attempt.answers.reduce(
    (sum: number, a: any) => sum + (a.pointsAwarded || 0),
    0
  );
  attempt.status = "graded";
  await attempt.save();

  SuccessResponse(res, { attempt }, 200);
};

// Reset attempt (reopen exam for student)
export const resetAttempt = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin)
    throw new UnauthorizedError("Only Super Admin can perform this action");

  const { id } = req.params;
  if (!id) throw new BadRequest("id is required");

  const attempt = await AttemptModel.findById(id);
  if (!attempt) throw new NotFound("Attempt not found");

  attempt.status = "in-progress";
  attempt.submittedAt = null;
attempt.answers = [] as any;
  attempt.totalPoints = 0;

  await attempt.save();
  SuccessResponse(res, { message: "Attempt reset", attempt }, 200);
};

// Delete attempt
export const deleteAttempt = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin)
    throw new UnauthorizedError("Only Super Admin can perform this action");

  const { id } = req.params;
  if (!id) throw new BadRequest("id is required");

  const attempt = await AttemptModel.findByIdAndDelete(id);
  if (!attempt) throw new NotFound("Attempt not found");

  SuccessResponse(res, { message: "Attempt deleted", attempt }, 200);
};
