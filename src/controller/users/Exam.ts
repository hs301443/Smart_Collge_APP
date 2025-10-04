import { Request, Response } from "express";
import mongoose from "mongoose";
import { ExamModel } from "../../models/shema/Exam";
import { AttemptModel } from "../../models/shema/Attempt";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { uploadAnswerFile } from "../../utils/multer";

// ✅ جلب امتحانات الطالب
export const getExamsForStudent = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  // هات كل attempts اللي الطالب خلصها
  const submittedAttempts = await AttemptModel.find({
    student: req.user.id,
    status: "submitted",
  }).select("exam");

const submittedExamIds = submittedAttempts
  .map((a) => a.exam?.toString())
  .filter(Boolean);
  // استثناء الامتحانات اللي الطالب خلصها
  const exams = await ExamModel.find({
    level: req.user.level,
    department: req.user.department,
    _id: { $nin: submittedExamIds },
  }).select("-questions");

  SuccessResponse(res, { exams }, 200);
};

// ✅ جلب امتحان محدد
export const getExamByIdForStudent = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const exam = await ExamModel.findById(req.params.id).select("-questions");
  if (!exam || !exam.isPublished) throw new NotFound("Exam not published");

  SuccessResponse(res, { exam }, 200);
};

// ✅ جلب الأسئلة بدون الإجابات الصحيحة
export const getQuestionsForExam = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const examId = req.params.examId;

  // نتحقق أن الطالب عنده attempt شغالة للامتحان
  const attempt = await AttemptModel.findOne({
    exam: examId,
    student: req.user.id,
    status: "in-progress"
  });

  if (!attempt) {
    throw new BadRequest("You must start the exam before viewing questions");
  }

  const exam = await ExamModel.findById(examId);
  if (!exam || !exam.isPublished) throw new NotFound("Exam not found");

  const questions = exam.questions.map((q) => ({
    _id: q._id,
    text: q.text,
    type: q.type,
    choices: q.choices,
    points: q.points,
    image: q.image,
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

  // ❌ منع إنشاء Attempt جديدة لو عنده Attempt موجودة بالفعل
  const existing = await AttemptModel.findOne({
    exam: examId,
    student: req.user.id,
    status: { $in: ["in-progress", "submitted"] },
  });

  if (existing) throw new BadRequest("You already have an attempt for this exam");

  const attempt = await AttemptModel.create({
    exam: examId,
    student: req.user.id,
    answers: [],
    status: "in-progress",
    startedAt: new Date(),
    endAt: new Date(Date.now() + exam.durationMinutes * 60 * 1000),
  });

  SuccessResponse(res, { attempt }, 201);
};

// ✅ حفظ إجابة
export const saveAnswer = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");
  const userId = req.user.id;

  uploadAnswerFile.single("file")(req, res, async (err: any) => {
    if (err) return res.status(400).json({ message: err.message });

    const { attemptId, questionId, answer } = req.body;

    if (!attemptId || !questionId) {
      throw new BadRequest("attemptId and questionId are required");
    }

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      throw new BadRequest("Invalid attemptId format");
    }

    const attempt = await AttemptModel.findById(attemptId);
    if (!attempt) throw new NotFound("Attempt not found");

    if (attempt.student?.toString() !== userId.toString()) {
      throw new UnauthorizedError("You are not allowed to modify this attempt");
    }

    // ⏰ التحقق من انتهاء الوقت
    if (new Date(attempt.endAt!).getTime() < Date.now()) {
    attempt.status = "expired";
    await attempt.save();
    throw new BadRequest("Time is over! Exam has expired.");
}

    if (attempt.status !== "in-progress") {
      throw new BadRequest("Attempt is already submitted or expired");
    }

    const exam = await ExamModel.findOne({ "questions._id": questionId });
    if (!exam) throw new NotFound("Question not found");

    const question = exam.questions.id(questionId);
    if (!question) throw new NotFound("Question not found");

    const filePath = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/answers/${req.file.filename}`
      : null;

    const existingAnswer = attempt.answers.find(
      (a: any) => a.question && a.question._id.toString() === questionId
    );

    if (existingAnswer) {
      existingAnswer.answer = answer;
      if (filePath) existingAnswer.file = filePath;
    } else {
      attempt.answers.push({
        question: question.toObject(),
        answer,
        file: filePath
      });
    }

    await attempt.save();
    SuccessResponse(res, { attempt }, 200);
  });
};


// ✅ Submit Attempt (تصحيح تلقائي)
export const submitAttempt = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");

  const { attemptId } = req.body;
  if (!attemptId) throw new BadRequest("attemptId is required");

  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    throw new BadRequest("Invalid attemptId format");
  }

  const attempt = await AttemptModel.findById(attemptId);
  if (!attempt) throw new NotFound("Attempt not found");

  if (attempt.student?.toString() !== req.user.id.toString()) {
    throw new UnauthorizedError("You are not allowed to submit this attempt");
  }

  // ⏰ التحقق من الوقت
  if (new Date() > new Date(attempt.endAt ?? '')) {
    attempt.status = "expired";
    await attempt.save();
    throw new BadRequest("You cannot submit after time has ended");
  }

  if (attempt.status !== "in-progress") {
    throw new BadRequest("Attempt already submitted or graded");
  }

  let totalPoints = 0;
  let correctCount = 0;
  let wrongCount = 0;

  // ✅ التصحيح التلقائي
  for (const ans of attempt.answers) {
    const q: any = ans.question;
    if (!q) continue;

    let awarded = 0;

    if (["MCQ", "short-answer"].includes(q.type)) {
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

  // ✅ تجهيز الرد التفصيلي للطالب
  const result = {
    examId: attempt.exam,
    totalPoints: attempt.totalPoints,
    correctCount: attempt.correctCount,
    wrongCount: attempt.wrongCount,
    submittedAt: attempt.submittedAt,
    answers: attempt.answers.map((a: any) => ({
      questionText: a.question.text,
      questionType: a.question.type,
      points: a.question.points,
      studentAnswer: a.answer,
      correctAnswer: a.question.correctAnswer,
      isCorrect:
        JSON.stringify(a.answer) === JSON.stringify(a.question.correctAnswer),
      pointsAwarded: a.pointsAwarded,
    })),
  };

  SuccessResponse(res, { result }, 200);
};


// ✅ جلب كل محاولات الطالب
export const getMyAttempts = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const attempts = await AttemptModel.find({ student: req.user.id })
    .populate("exam", "title subject_name level department startAt endAt durationMinutes")
    .populate("answers.question", "text type points");

  SuccessResponse(res, { attempts }, 200);
};
