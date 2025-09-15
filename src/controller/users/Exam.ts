import { Request, Response } from "express";
import { ExamModel } from "../../models/shema/Exam";
import { AttemptModel } from "../../models/shema/Attempt";
import { QuestionModel } from "../../models/shema/Questions";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

// ✅ Get all exams for logged-in student (filtered by department & level)
export const getExamsForStudent = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const { level, department } = req.user;
  if (!level || !department) throw new BadRequest("User must have level and department");

  const exams = await ExamModel.find({ level, department });
  SuccessResponse(res, { exams }, 200);
};

// ✅ Get single exam by ID
export const getExamByIdForStudent = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const { id } = req.params;
  if (!id) throw new BadRequest("Exam ID is required");

  const exam = await ExamModel.findById(id);
  if (!exam) throw new NotFound("Exam not found");

  if (exam.level !== req.user.level || exam.department !== req.user.department) {
    throw new UnauthorizedError("You are not allowed to access this exam");
  }

  SuccessResponse(res, { exam }, 200);
};

// ✅ Start an attempt for an exam
export const startExamAttempt = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const { examId } = req.body;
  if (!examId) throw new BadRequest("examId is required");

  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFound("Exam not found");

  // Check if already attempted
  const existingAttempt = await AttemptModel.findOne({
    exam: examId,
    student: req.user.id,
    status: { $ne: "graded" }, // لو لسه مش متصحح
  });

  if (existingAttempt) {
    throw new BadRequest("You already have an attempt for this exam");
  }

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

// ✅ Submit answers for an exam attempt
export const submitExamAttempt = async (req: Request, res: Response) => {
   if (!req.user || !req.user.id) {
  throw new UnauthorizedError("User not authenticated");
   }

  const { attemptId, answers } = req.body; // answers = [{questionId, answer}]
  if (!attemptId || !answers) throw new BadRequest("attemptId and answers are required");

  const attempt = await AttemptModel.findById(attemptId);
  if (!attempt) throw new NotFound("Attempt not found");

  if (attempt.student.toString() !== req.user.id.toString()) {
    throw new UnauthorizedError("You are not allowed to submit this attempt");
  }

  if (attempt.status !== "in-progress") {
    throw new BadRequest("This attempt is already submitted or graded");
  }

  // Check answers and auto-grade (for MCQ & True/False)
  let totalPoints = 0;

  for (const submittedAnswer of answers) {
    const question = await QuestionModel.findById(submittedAnswer.questionId);
    if (!question) continue;

    let pointsAwarded = 0;

    if (
      (question.type === "single-choice" ||
        question.type === "multiple-choice" ||
        question.type === "true-false" &&
      question.correctAnswer)
    ) {
      // Auto-grading simple logic
      if (JSON.stringify(submittedAnswer.answer) === JSON.stringify(question.correctAnswer)) {
        pointsAwarded = question.points;
      }
    }

    attempt.answers.push({
      question: question._id,
      answer: submittedAnswer.answer,
      pointsAwarded,
    } as any);

    totalPoints += pointsAwarded;
  }

  attempt.totalPoints = totalPoints;
  attempt.status = "submitted";
  attempt.submittedAt = new Date();
  await attempt.save();

  SuccessResponse(res, { attempt }, 200);
};

// ✅ Get student's own attempts
export const getMyAttempts = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const attempts = await AttemptModel.find({ student: req.user.id })
    .populate("exam", "title department level")
    .populate("answers.question", "text type");

  SuccessResponse(res, { attempts }, 200);
};

