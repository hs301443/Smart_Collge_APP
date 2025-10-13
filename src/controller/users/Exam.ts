import { Request, Response } from "express";
import mongoose from "mongoose";
import { ExamModel } from "../../models/shema/Exam";
import { AttemptModel } from "../../models/shema/Attempt";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { uploadAnswerFile } from "../../utils/multer";


export const getExamsForStudent = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) throw new UnauthorizedError("Unauthorized");

  // 🧠 نجيب كل المحاولات اللي الطالب خلصها أو انتهت
  const finishedAttempts = await AttemptModel.find({
    student: req.user.id,
    status: { $in: ["submitted", "expired"] },
  }).select("exam");

  const finishedExamIds = finishedAttempts
    .map(a => a.exam?.toString())
    .filter(Boolean);

  // 📚 نجيب الامتحانات اللي الطالب لسه ما عملهاش
  const exams = await ExamModel.find({
    level: req.user.level,
    department: req.user.department,
    _id: { $nin: finishedExamIds }, // 👈 نستبعد الامتحانات اللي خلصها
    isPublished: true, // 👈 فقط المنشورة
  }).select("-questions"); // 👈 من غير الأسئلة للحماية

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
  const exam = await ExamModel.findById(examId);
  if (!exam || !exam.isPublished) throw new NotFound("Exam not found");

  // ✅ نتحقق هل الطالب عمل محاولة Exam Attempt
  const attempt = await AttemptModel.findOne({
    exam: examId,
    student: req.user._id,
    status: "submitted", // فقط الامتحانات اللي خلصها فعلاً
  });

  const hasSubmitted = !!attempt; // true لو الطالب خلص الامتحان

  // ✅ نجهّز الأسئلة
  const questions = exam.questions.map(q => {
    const questionData: any = {
      _id: q._id,
      text: q.text,
      type: q.type,
      choices: q.choices,
      points: q.points,
      image: q.image,
    };

    // ✅ لو الطالب امتحن بالفعل، نضيف correctAnswer
    if (hasSubmitted) {
      questionData.correctAnswer = q.correctAnswer;
    }

    return questionData;
  });

  SuccessResponse(res, { questions, hasSubmitted }, 200);
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
export const saveAnswer = async (req: any, res: Response) => {
  if (!req.user || !req.user.id)
    return res.status(401).json({ message: "Unauthorized" });

  const userId = req.user.id;

  // ⬇️ رفع الملف (لو فيه ملف مرفق)
  await new Promise<void>((resolve, reject) => {
    uploadAnswerFile.single("file")(req, res, (err: any) => {
      if (err) return reject(err);
      resolve();
    });
  });

  const { attemptId, questionId, answer } = req.body;
  if (!attemptId || !questionId)
    return res.status(400).json({ message: "attemptId and questionId are required" });

  // ⬇️ نجيب محاولة الطالب
  const attempt = await AttemptModel.findById(attemptId);
  if (!attempt) return res.status(404).json({ message: "Attempt not found" });

  if (attempt.student?.toString() !== userId.toString())
    return res.status(403).json({ message: "Not allowed" });

  // ⬇️ نجيب الامتحان والسؤال المطلوب
  const exam = await ExamModel.findOne({ "questions._id": questionId });
  if (!exam) return res.status(404).json({ message: "Question not found" });

  const question = exam.questions.id(questionId);
  if (!question) return res.status(404).json({ message: "Question not found" });

  // ⏰ التأكد من الوقت
  if (attempt.endAt && new Date(attempt.endAt) < new Date()) {
    attempt.status = "expired";
    await attempt.save();
    return res.status(400).json({ message: "Time is over! Exam has expired." });
  }

  // ⬇️ تحديد مسار الملف (لو موجود)
  const filePath = req.file
    ? `${req.protocol}://${req.get("host")}/uploads/answers/${req.file.filename}`
    : null;

  // ⬇️ التأكد هل الطالب جاوب على السؤال قبل كده
  const existingAnswer = attempt.answers.find(
    (a: any) => a.question?.toString() === questionId
  );

  if (existingAnswer) {
    existingAnswer.answer = answer;
    if (filePath) existingAnswer.file = filePath;
  } else {
    attempt.answers.push({
      question: question._id, // 👈 نخزن الـ ObjectId فقط
      answer,
      file: filePath,
    });
  }

  await attempt.save();

  return SuccessResponse(res, { attempt }, 200);
};

// ✅ Submit Attempt
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

  if (attempt.status !== "in-progress") {
    throw new BadRequest("Attempt already submitted or graded");
  }

  let totalPoints = 0;
  let correctCount = 0;
  let wrongCount = 0;

  const normalize = (val: any) => {
    if (Array.isArray(val)) return val.map(String).sort();
    if (typeof val === "string") return val.trim().toLowerCase();
    return String(val);
  };

  // ✅ نجيب الامتحان الأصلي
  const exam = await ExamModel.findById(attempt.exam);
  if (!exam) throw new NotFound("Exam not found");

  // ✅ نحسب مجموع نقاط الامتحان (الدرجة النهائية)
  const maxPoints = exam.questions.reduce((sum, q) => sum + (q.points || 0), 0);

  for (const ans of attempt.answers) {
    const questionId = ans.question ? new mongoose.Types.ObjectId(ans.question) : null;
    const question = questionId ? exam.questions.id(questionId) : null;
    if (!question) continue;

    let awarded = 0;
    const userAns = normalize(ans.answer);
    const correctAns = normalize(question.correctAnswer);

    if (["MCQ", "short-answer"].includes(question.type)) {
      if (correctAns && JSON.stringify(userAns) === JSON.stringify(correctAns)) {
        awarded = question.points ?? 0;
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

  // ✅ نرجّع النتيجة بدون النسبة
  SuccessResponse(res, {
    attempt,
    examTitle: exam.title,
    maxPoints,
    scoredPoints: totalPoints
  }, 200);
};


// ✅ جلب كل محاولات الطالب
export const getMyAttempts = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const attempts = await AttemptModel.find({ student: req.user.id })
    .populate(
      "exam",
      "title subject_name level department startAt endAt durationMinutes"
    )
    .populate("answers.question", "text type points correctAnswer");

  // 🎯 إخفاء الإجابات الصحيحة لو الطالب لسه ما سلّمش الامتحان
  const filteredAttempts = attempts.map((attempt: any) => {
    if (attempt.status !== "submitted") {
      attempt.answers = attempt.answers.map((ans: any) => {
        if (ans.question && ans.question.correctAnswer) {
          ans.question.correctAnswer = undefined; // 🔒 نخفيها مؤقتًا
        }
        return ans;
      });
    }
    return attempt;
  });

  SuccessResponse(res, { attempts: filteredAttempts }, 200);
};
