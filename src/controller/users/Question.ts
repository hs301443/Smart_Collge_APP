import { Request, Response } from "express";
import { QuestionModel } from "../../models/shema/Questions";
import { ExamModel } from "../../models/shema/Exam";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

// ✅ Get all questions for an exam (without correct answers)
export const getQuestionsForExam = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const { examId } = req.params;
  if (!examId) throw new BadRequest("Exam ID is required");

  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFound("Exam not found");

  // Check if exam belongs to student's department & level
  if (exam.level !== req.user.level || exam.department !== req.user.department) {
    throw new UnauthorizedError("You are not allowed to access this exam");
  }
  if (exam.isPublished==false) {
    throw new NotFound("exam is not published");
  }

  const questions = await QuestionModel.find({ exam: examId }).select(
    "-correctAnswer" // hide correct answer
  ).populate("exam","name title subject_name level department durationMinutes startAt endAt ");

  SuccessResponse(res, { questions }, 200);
};

// ✅ Get single question by ID (without correct answer)
export const getQuestionByIdForStudent = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const { questionId } = req.params;
  if (!questionId) throw new BadRequest("Question ID is required");

  const question = await QuestionModel.findById(questionId).select("-correctAnswer");
  if (!question) throw new NotFound("Question not found");

  SuccessResponse(res, { question }, 200);
};

// ✅ Get next/previous question (pagination style)
export const getQuestionByIndex = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const { examId, index } = req.params;
  if (!examId || index === undefined) throw new BadRequest("ExamId and index are required");

  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFound("Exam not found");

  if (exam.level !== req.user.level || exam.department !== req.user.department) {
    throw new UnauthorizedError("You are not allowed to access this exam");
  }

  if (exam.isPublished==false) {
    throw new NotFound("exam is not published");
  }

  const questions = await QuestionModel.find({ exam: examId }).select("-correctAnswer");
  const idx = parseInt(index, 10);

  if (idx < 0 || idx >= questions.length) throw new NotFound("Invalid question index");

  const question = questions[idx];

  SuccessResponse(res, {
    question,
    index: idx,
    total: questions.length,
  }, 200);
};
