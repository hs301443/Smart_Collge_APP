import { Request, Response } from "express";
import { AttemptModel } from "../../models/shema/Attempt";
import { ExamModel } from "../../models/shema/Exam";
import { QuestionModel } from "../../models/shema/Questions";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

// ✅ 1. Start Attempt
export const startAttempt = async (req: Request, res: Response) => {
  if (!req.user||!req.user.id) throw new UnauthorizedError("Unauthorized");

  const { examId } = req.body;
  if (!examId) throw new BadRequest("Exam ID is required");

  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFound("Exam not found");

  // Check if user already has attempt
  const existing = await AttemptModel.findOne({
    exam: examId,
    student: req.user.id,
    status: { $ne: "graded" },
  });

  if (existing) throw new BadRequest("You already started this exam");

  const attempt = await AttemptModel.create({
    exam: examId,
    student: req.user.id,
    answers: [],
    totalPoints: 0,
    status: "in-progress",
    startedAt: new Date(),
  });

  SuccessResponse(res, { attempt }, 201);
};

// ✅ 2. Save Answer (while in-progress)
export const saveAnswer = async (req: Request, res: Response) => {
  if (!req.user||!req.user.id) throw new UnauthorizedError("Unauthorized");

  const { attemptId, questionId, answer, file } = req.body;
  if (!attemptId || !questionId) throw new BadRequest("attemptId and questionId are required");

  const attempt = await AttemptModel.findById(attemptId);
  if (!attempt) throw new NotFound("Attempt not found");

  if (attempt.student.toString() !== req.user.id.toString()) {
    throw new UnauthorizedError("You are not allowed to modify this attempt");
  }

  if (attempt.status !== "in-progress") {
    throw new BadRequest("Attempt is already submitted");
  }

  // check question
  const question = await QuestionModel.findById(questionId);
  if (!question) throw new NotFound("Question not found");

  // push or update answer
  const existingAnswer = attempt.answers.find(
    (a: any) => a.question.toString() === questionId
  );

  if (existingAnswer) {
    existingAnswer.answer = answer;
    if (file) existingAnswer.file = file;
  } else {
    attempt.answers.push({ question: questionId, answer, file });
  }

  await attempt.save();
  SuccessResponse(res, { attempt }, 200);
};

// ✅ 3. Submit Attempt
export const submitAttempt = async (req: Request, res: Response) => {
  if (!req.user||!req.user.id) throw new UnauthorizedError("Unauthorized");

  const { attemptId } = req.body;
  if (!attemptId) throw new BadRequest("attemptId is required");

  const attempt = await AttemptModel.findById(attemptId).populate("answers.question");
  if (!attempt) throw new NotFound("Attempt not found");

  if (attempt.student.toString() !== req.user.id.toString()) {
    throw new UnauthorizedError("You are not allowed to submit this attempt");
  }

  if (attempt.status !== "in-progress") {
    throw new BadRequest("Attempt already submitted or graded");
  }

  // Auto-grading simple questions
  let totalPoints = 0;
  for (const ans of attempt.answers) {
    const q: any = ans.question;
    let awarded = 0;

    if (["single-choice", "multiple-choice", "true-false"].includes(q.type)) {
      if (JSON.stringify(ans.answer) === JSON.stringify(q.correctAnswer)) {
        awarded = q.points;
      }
    }

    ans.pointsAwarded = awarded;
    totalPoints += awarded;
  }

  attempt.totalPoints = totalPoints;
  attempt.status = "submitted";
  attempt.submittedAt = new Date();

  await attempt.save();
  SuccessResponse(res, { attempt }, 200);
};

// ✅ 4. Get My Attempts
export const getMyAttempts = async (req: Request, res: Response) => {
  if (!req.user||!req.user.id) throw new UnauthorizedError("Unauthorized");

  const attempts = await AttemptModel.find({ student: req.user.id })
    .populate("exam", "title subject_name level department")
    .populate("answers.question", "text type points");

  SuccessResponse(res, { attempts }, 200);
};
