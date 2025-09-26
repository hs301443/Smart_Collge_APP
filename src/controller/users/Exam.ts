import { Request, Response } from "express";
import { ExamModel } from "../../models/shema/Exam";
import { AttemptModel } from "../../models/shema/Attempt";
import {  NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { uploadAnswerFile } from "../../utils/multer";
export const getExamsForStudent = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const exams = await ExamModel.find({ 
    level: req.user.level, 
    department: req.user.department,
    
  }).select("-questions");

  SuccessResponse(res, { exams }, 200);
};

// ✅ جلب امتحان محدد
export const getExamByIdForStudent = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const exam = await ExamModel.findById(req.params.id);
  if (!exam || !exam.isPublished) throw new NotFound("Exam not found");

  SuccessResponse(res, { exam }, 200);
};

// ✅ جلب الأسئلة بدون الإجابات الصحيحة
export const getQuestionsForExam = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const exam = await ExamModel.findById(req.params.examId);
  if (!exam || !exam.isPublished) throw new NotFound("Exam not found");

  const questions = exam.questions.map(q => ({
    _id: q._id,
    text: q.text,
    type: q.type,
    choices: q.choices,
    points: q.points,
    image: q.image
  }));

  SuccessResponse(res, { questions }, 200);
};

// ✅ بدء Attempt
export const startAttempt = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const { examId } = req.body;
  if (!examId) throw new BadRequest("Exam ID is required");

  const exam = await ExamModel.findById(examId);
  if (!exam || !exam.isPublished) throw new NotFound("Exam not found");

  const existing = await AttemptModel.findOne({
    exam: examId,
    student: req.user.id,
    status: "in-progress"
  });

  if (existing) return SuccessResponse(res, { attempt: existing }, 200);

  const attempt = await AttemptModel.create({
    exam: examId,
    student: req.user.id,
    answers: [],
    status: "in-progress",
    startedAt: new Date(),
    endAt: new Date(Date.now() + exam.durationMinutes * 60 * 1000)
  });

  SuccessResponse(res, { attempt }, 201);
};

// ✅ حفظ إجابة
// ✅ Save Answer (while in-progress)
export const saveAnswer = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");
  const userId = req.user.id;

  uploadAnswerFile.single("file")(req, res, async (err: any) => {
    if (err) return res.status(400).json({ message: err.message });

    const { attemptId, questionId, answer } = req.body;
    if (!attemptId || !questionId) throw new BadRequest("attemptId and questionId are required");

    // جلب Attempt
    const attempt = await AttemptModel.findById(attemptId);
    if (!attempt) throw new NotFound("Attempt not found");

    if (attempt.student?.toString() !== userId.toString()) {
      throw new UnauthorizedError("You are not allowed to modify this attempt");
    }

    if (attempt.status !== "in-progress") {
      throw new BadRequest("Attempt is already submitted");
    }

    const exam = await ExamModel.findOne({ "questions._id": questionId });
    if (!exam) throw new NotFound("Question not found");

    const question = exam.questions.id(questionId);
    if (!question) throw new NotFound("Question not found");

    // ملف الطالب مع رابط كامل
    const filePath = req.file 
      ? `${req.protocol}://${req.get('host')}/uploads/answers/${req.file.filename}`
      : null;

    // تحديث أو إضافة الإجابة
    const existingAnswer = attempt.answers.find(
      (a: any) => a.question && a.question.toString() === questionId
    );

    if (existingAnswer) {
      existingAnswer.answer = answer;
      if (filePath) existingAnswer.file = filePath;
    } else {
      attempt.answers.push({ question: questionId, answer, file: filePath });
    }

    await attempt.save();
    SuccessResponse(res, { attempt }, 200);
  });
};
// ✅ Submit Attempt
export const submitAttempt = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");

  const { attemptId } = req.body;
  if (!attemptId) throw new BadRequest("attemptId is required");

  const attempt = await AttemptModel.findById(attemptId).populate("answers.question");
  if (!attempt) throw new NotFound("Attempt not found");

  if (attempt.student?.toString() !== req.user.id.toString()) {
    throw new UnauthorizedError("You are not allowed to submit this attempt");
  }

  if (attempt.status !== "in-progress") {
    throw new BadRequest("Attempt already submitted or graded");
  }

  // Auto-grading simple questions
  let totalPoints = 0;
  let correctCount = 0;
  let wrongCount = 0;

  for (const ans of attempt.answers) {
    const q: any = ans.question;
    if (!q) continue; // لو السؤال غير موجود نتخطاه

    let awarded = 0;
    if (["single-choice", "multiple-choice", "true-false", "short-answer"].includes(q.type)) {
      if (JSON.stringify(ans.answer) === JSON.stringify(q.correctAnswer)) {
        awarded = q.points ?? 0;
        correctCount++;
      } else {
        wrongCount++;
      }
    }

    ans.pointsAwarded = awarded;
    totalPoints += awarded;
  }

  attempt.totalPoints = totalPoints;
  attempt.correctCount = correctCount;
  attempt.wrongCount = wrongCount;
  attempt.status = "submitted";
  attempt.submittedAt = new Date();

  await attempt.save();
  SuccessResponse(res, { attempt }, 200);
};


// ✅ جلب كل محاولات الطالب
export const getMyAttempts = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const attempts = await AttemptModel.find({ student: req.user.id })
    .populate("exam", "title subject_name level department startAt endAt durationMinutes")
    .populate("answers.question", "text type points");

  SuccessResponse(res, { attempts }, 200);
};
