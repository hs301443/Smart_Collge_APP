import { Request, Response } from "express";
import { ExamModel } from "../../models/shema/Exam";
import { QuestionModel } from "../../models/shema/Questions";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

// 📌 Get questions of a specific exam (for logged-in student)
export const getQuestionsForExam = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const { examId } = req.params;
  if (!examId) throw new BadRequest("examId is required");

  // ✅ تأكد إن الامتحان موجود
  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFound("Exam not found");

  // ✅ تأكد إن الامتحان يخص القسم والليفل بتوع الطالب
  if (exam.level !== req.user.level || exam.department !== req.user.department) {
    throw new UnauthorizedError("You are not allowed to access this exam");
  }

  // ✅ هات كل الأسئلة
  const questions = await QuestionModel.find({ exam: examId }).select("-correctAnswer"); 
  // 🔒 عشان الطالب ما يشوفش الحلول

  SuccessResponse(res, { examId, questions }, 200);
};


// 📌 Get a single question by ID (for logged-in student)
export const getQuestionByIdForExam = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const { examId, questionId } = req.params;
  if (!examId || !questionId) throw new BadRequest("examId and questionId are required");

  // ✅ تأكد إن الامتحان موجود
  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFound("Exam not found");

  // ✅ تأكد إن الامتحان يخص القسم والليفل بتوع الطالب
  if (exam.level !== req.user.level || exam.department !== req.user.department) {
    throw new UnauthorizedError("You are not allowed to access this exam");
  }

  // ✅ هات السؤال
  const question = await QuestionModel.findOne({ _id: questionId, exam: examId }).select("-correctAnswer");
  if (!question) throw new NotFound("Question not found");

  SuccessResponse(res, { examId, question }, 200);
};

