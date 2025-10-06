"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAttempts = exports.submitAttempt = exports.saveAnswer = exports.startAttempt = exports.getQuestionsForExam = exports.getExamByIdForStudent = exports.getExamsForStudent = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Exam_1 = require("../../models/shema/Exam");
const Attempt_1 = require("../../models/shema/Attempt");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const multer_1 = require("../../utils/multer");
const getExamsForStudent = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    // 🧠 نجيب كل المحاولات اللي الطالب خلصها أو انتهت
    const finishedAttempts = await Attempt_1.AttemptModel.find({
        student: req.user.id,
        status: { $in: ["submitted", "expired"] },
    }).select("exam");
    const finishedExamIds = finishedAttempts
        .map(a => a.exam?.toString())
        .filter(Boolean);
    // 📚 نجيب الامتحانات اللي الطالب لسه ما عملهاش
    const exams = await Exam_1.ExamModel.find({
        level: req.user.level,
        department: req.user.department,
        _id: { $nin: finishedExamIds }, // 👈 نستبعد الامتحانات اللي خلصها
        isPublished: true, // 👈 فقط المنشورة
    }).select("-questions"); // 👈 من غير الأسئلة للحماية
    (0, response_1.SuccessResponse)(res, { exams }, 200);
};
exports.getExamsForStudent = getExamsForStudent;
// ✅ جلب امتحان محدد
const getExamByIdForStudent = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const exam = await Exam_1.ExamModel.findById(req.params.id).select("-questions");
    if (!exam || !exam.isPublished)
        throw new Errors_1.NotFound("Exam not published");
    (0, response_1.SuccessResponse)(res, { exam }, 200);
};
exports.getExamByIdForStudent = getExamByIdForStudent;
// ✅ جلب الأسئلة بدون الإجابات الصحيحة
const getQuestionsForExam = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const exam = await Exam_1.ExamModel.findById(req.params.examId);
    if (!exam || !exam.isPublished)
        throw new Errors_1.NotFound("Exam not found");
    const questions = exam.questions.map(q => ({
        _id: q._id,
        text: q.text,
        type: q.type,
        choices: q.choices,
        points: q.points,
        image: q.image
    }));
    (0, response_1.SuccessResponse)(res, { questions }, 200);
};
exports.getQuestionsForExam = getQuestionsForExam;
// ✅ بدء Attempt
const startAttempt = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { examId } = req.body;
    if (!examId)
        throw new BadRequest_1.BadRequest("Exam ID is required");
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam || !exam.isPublished)
        throw new Errors_1.NotFound("Exam not found");
    const existing = await Attempt_1.AttemptModel.findOne({
        exam: examId,
        student: req.user.id,
        status: "in-progress"
    });
    if (existing)
        return (0, response_1.SuccessResponse)(res, { attempt: existing }, 200);
    const attempt = await Attempt_1.AttemptModel.create({
        exam: examId,
        student: req.user.id,
        answers: [],
        status: "in-progress",
        startedAt: new Date(),
        endAt: new Date(Date.now() + exam.durationMinutes * 60 * 1000)
    });
    (0, response_1.SuccessResponse)(res, { attempt }, 201);
};
exports.startAttempt = startAttempt;
// ✅ حفظ إجابة
const saveAnswer = async (req, res) => {
    if (!req.user || !req.user.id)
        return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.id;
    // ⬇️ رفع الملف (لو فيه ملف مرفق)
    await new Promise((resolve, reject) => {
        multer_1.uploadAnswerFile.single("file")(req, res, (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
    const { attemptId, questionId, answer } = req.body;
    if (!attemptId || !questionId)
        return res.status(400).json({ message: "attemptId and questionId are required" });
    // ⬇️ نجيب محاولة الطالب
    const attempt = await Attempt_1.AttemptModel.findById(attemptId);
    if (!attempt)
        return res.status(404).json({ message: "Attempt not found" });
    if (attempt.student?.toString() !== userId.toString())
        return res.status(403).json({ message: "Not allowed" });
    // ⬇️ نجيب الامتحان والسؤال المطلوب
    const exam = await Exam_1.ExamModel.findOne({ "questions._id": questionId });
    if (!exam)
        return res.status(404).json({ message: "Question not found" });
    const question = exam.questions.id(questionId);
    if (!question)
        return res.status(404).json({ message: "Question not found" });
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
    const existingAnswer = attempt.answers.find((a) => a.question?.toString() === questionId);
    if (existingAnswer) {
        existingAnswer.answer = answer;
        if (filePath)
            existingAnswer.file = filePath;
    }
    else {
        attempt.answers.push({
            question: question._id, // 👈 نخزن الـ ObjectId فقط
            answer,
            file: filePath,
        });
    }
    await attempt.save();
    return (0, response_1.SuccessResponse)(res, { attempt }, 200);
};
exports.saveAnswer = saveAnswer;
// ✅ Submit Attempt
const submitAttempt = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { attemptId } = req.body;
    if (!attemptId)
        throw new BadRequest_1.BadRequest("attemptId is required");
    if (!mongoose_1.default.Types.ObjectId.isValid(attemptId)) {
        throw new BadRequest_1.BadRequest("Invalid attemptId format");
    }
    const attempt = await Attempt_1.AttemptModel.findById(attemptId);
    if (!attempt)
        throw new Errors_1.NotFound("Attempt not found");
    if (attempt.student?.toString() !== req.user.id.toString()) {
        throw new Errors_1.UnauthorizedError("You are not allowed to submit this attempt");
    }
    if (attempt.status !== "in-progress") {
        throw new BadRequest_1.BadRequest("Attempt already submitted or graded");
    }
    let totalPoints = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const normalize = (val) => {
        if (Array.isArray(val))
            return val.map(String).sort();
        if (typeof val === "string")
            return val.trim().toLowerCase();
        return String(val);
    };
    // ✅ نجيب الامتحان عشان نقدر نجيب الإجابات الصحيحة من الأسئلة الأصلية
    const exam = await Exam_1.ExamModel.findById(attempt.exam);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    for (const ans of attempt.answers) {
        const questionId = ans.question ? new mongoose_1.default.Types.ObjectId(ans.question) : null;
        const question = questionId ? exam.questions.id(questionId) : null;
        if (!question)
            continue;
        let awarded = 0;
        const userAns = normalize(ans.answer);
        const correctAns = normalize(question.correctAnswer);
        if (["MCQ", "short-answer"].includes(question.type)) {
            if (correctAns && JSON.stringify(userAns) === JSON.stringify(correctAns)) {
                awarded = question.points ?? 0;
                correctCount++;
            }
            else {
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
    (0, response_1.SuccessResponse)(res, { attempt }, 200);
};
exports.submitAttempt = submitAttempt;
// ✅ جلب كل محاولات الطالب
const getMyAttempts = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const attempts = await Attempt_1.AttemptModel.find({ student: req.user.id })
        .populate("exam", "title subject_name level department startAt endAt durationMinutes")
        .populate("answers.question", "text type points image correctAnswer choices  answer"); // ✨ جبت نص السؤال ونوعه والنقط
    (0, response_1.SuccessResponse)(res, { attempts }, 200);
};
exports.getMyAttempts = getMyAttempts;
