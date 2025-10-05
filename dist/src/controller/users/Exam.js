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
// ✅ جلب كل الامتحانات المتاحة للطالب
const getExamsForStudent = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    // 🧠 نجيب كل المحاولات اللي الطالب خلصها أو انتهى وقتها
    const finishedAttempts = await Attempt_1.AttemptModel.find({
        student: req.user.id,
        status: { $in: ["submitted", "expired"] },
    }).select("exam");
    const finishedExamIds = finishedAttempts.map((a) => a.exam?.toString()).filter(Boolean);
    // 📚 نجيب الامتحانات اللي الطالب لسه ما عملهاش
    const exams = await Exam_1.ExamModel.find({
        level: req.user.level,
        department: req.user.department,
        _id: { $nin: finishedExamIds },
        isPublished: true,
    }).lean();
    // 🚫 نحذف الأسئلة يدويًا
    const safeExams = exams.map(({ questions, ...rest }) => rest);
    (0, response_1.SuccessResponse)(res, { message: "Exams fetched successfully", exams: safeExams }, 200);
};
exports.getExamsForStudent = getExamsForStudent;
// ✅ جلب امتحان محدد (بدون الأسئلة)
const getExamByIdForStudent = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const exam = await Exam_1.ExamModel.findById(req.params.id).lean();
    if (!exam || !exam.isPublished)
        throw new Errors_1.NotFound("Exam not published");
    // 🚫 إزالة الأسئلة قبل الإرسال
    const { questions, ...safeExam } = exam;
    (0, response_1.SuccessResponse)(res, { exam: safeExam }, 200);
};
exports.getExamByIdForStudent = getExamByIdForStudent;
// ✅ جلب الأسئلة بدون correctAnswer
const getQuestionsForExam = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const examId = req.params.examId;
    // تأكد أن الطالب بدأ attempt فعلاً
    const attempt = await Attempt_1.AttemptModel.findOne({
        exam: examId,
        student: req.user.id,
        status: "in-progress",
    });
    if (!attempt)
        throw new BadRequest_1.BadRequest("You must start the exam before viewing questions");
    const exam = await Exam_1.ExamModel.findById(examId).lean();
    if (!exam || !exam.isPublished)
        throw new Errors_1.NotFound("Exam not found");
    const questions = exam.questions.map((question) => {
        const { correctAnswer, ...safeQ } = question;
        return safeQ;
    });
    (0, response_1.SuccessResponse)(res, { questions }, 200);
};
exports.getQuestionsForExam = getQuestionsForExam;
// ✅ بدء Attempt جديدة
const startAttempt = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { examId } = req.body;
    if (!examId)
        throw new BadRequest_1.BadRequest("Exam ID is required");
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam || !exam.isPublished)
        throw new Errors_1.NotFound("Exam not found");
    // ❌ منع محاولة جديدة لو عنده Attempt شغالة
    const existing = await Attempt_1.AttemptModel.findOne({
        exam: examId,
        student: req.user.id,
        status: { $in: ["in-progress", "submitted"] },
    });
    if (existing)
        throw new BadRequest_1.BadRequest("You already have an attempt for this exam");
    const attempt = await Attempt_1.AttemptModel.create({
        exam: examId,
        student: req.user.id,
        answers: [],
        status: "in-progress",
        startedAt: new Date(),
        endAt: new Date(Date.now() + exam.durationMinutes * 60 * 1000),
    });
    (0, response_1.SuccessResponse)(res, { attempt }, 201);
};
exports.startAttempt = startAttempt;
// ✅ حفظ إجابة سؤال
const saveAnswer = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const userId = req.user.id;
    multer_1.uploadAnswerFile.single("file")(req, res, async (err) => {
        if (err)
            return res.status(400).json({ message: err.message });
        const { attemptId, questionId, answer } = req.body;
        if (!attemptId || !questionId)
            throw new BadRequest_1.BadRequest("attemptId and questionId are required");
        if (!mongoose_1.default.Types.ObjectId.isValid(attemptId))
            throw new BadRequest_1.BadRequest("Invalid attemptId format");
        const attempt = await Attempt_1.AttemptModel.findById(attemptId);
        if (!attempt)
            throw new Errors_1.NotFound("Attempt not found");
        if (attempt.student?.toString() !== userId.toString()) {
            throw new Errors_1.UnauthorizedError("You are not allowed to modify this attempt");
        }
        // ⏰ التأكد أن الوقت ما انتهاش
        if (new Date(attempt.endAt).getTime() < Date.now()) {
            attempt.status = "expired";
            await attempt.save();
            throw new BadRequest_1.BadRequest("Time is over! Exam has expired.");
        }
        if (attempt.status !== "in-progress")
            throw new BadRequest_1.BadRequest("Attempt already submitted or expired");
        const exam = await Exam_1.ExamModel.findOne({ "questions._id": questionId });
        if (!exam)
            throw new Errors_1.NotFound("Question not found");
        const question = exam.questions.find((q) => q._id.toString() === questionId);
        if (!question)
            throw new Errors_1.NotFound("Question not found");
        const filePath = req.file
            ? `${req.protocol}://${req.get("host")}/uploads/answers/${req.file.filename}`
            : null;
        const existingAnswer = attempt.answers.find((a) => a.question && a.question._id.toString() === questionId);
        if (existingAnswer) {
            existingAnswer.answer = answer;
            if (filePath)
                existingAnswer.file = filePath;
        }
        else {
            attempt.answers.push({
                question: Object.assign({}, question),
                answer,
                file: filePath,
            });
        }
        await attempt.save();
        (0, response_1.SuccessResponse)(res, { attempt }, 200);
    });
};
exports.saveAnswer = saveAnswer;
// ✅ Submit Attempt (تصحيح تلقائي)
const submitAttempt = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { attemptId } = req.body;
    if (!attemptId)
        throw new BadRequest_1.BadRequest("attemptId is required");
    if (!mongoose_1.default.Types.ObjectId.isValid(attemptId))
        throw new BadRequest_1.BadRequest("Invalid attemptId format");
    const attempt = await Attempt_1.AttemptModel.findById(attemptId);
    if (!attempt)
        throw new Errors_1.NotFound("Attempt not found");
    if (attempt.student?.toString() !== req.user.id.toString()) {
        throw new Errors_1.UnauthorizedError("You are not allowed to submit this attempt");
    }
    // ⏰ تحقق من الوقت
    if (new Date() > new Date(attempt.endAt ?? "")) {
        attempt.status = "expired";
        await attempt.save();
        throw new BadRequest_1.BadRequest("You cannot submit after time has ended");
    }
    if (attempt.status !== "in-progress")
        throw new BadRequest_1.BadRequest("Attempt already submitted or graded");
    let totalPoints = 0;
    let correctCount = 0;
    let wrongCount = 0;
    // ✅ التصحيح التلقائي
    for (const ans of attempt.answers) {
        const q = ans.question;
        if (!q)
            continue;
        let awarded = 0;
        if (["MCQ", "short-answer"].includes(q.type)) {
            if (JSON.stringify(ans.answer) === JSON.stringify(q.correctAnswer)) {
                awarded = q.points ?? 0;
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
    const result = {
        examId: attempt.exam,
        totalPoints,
        correctCount,
        wrongCount,
        submittedAt: attempt.submittedAt,
        answers: attempt.answers.map((a) => ({
            questionText: a.question.text,
            questionType: a.question.type,
            points: a.question.points,
            studentAnswer: a.answer,
            correctAnswer: a.question.correctAnswer,
            isCorrect: JSON.stringify(a.answer) === JSON.stringify(a.question.correctAnswer),
            pointsAwarded: a.pointsAwarded,
        })),
    };
    (0, response_1.SuccessResponse)(res, { result }, 200);
};
exports.submitAttempt = submitAttempt;
// ✅ كل محاولات الطالب
const getMyAttempts = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const attempts = await Attempt_1.AttemptModel.find({ student: req.user.id })
        .populate("exam", "title subject_name level department startAt endAt durationMinutes")
        .lean();
    (0, response_1.SuccessResponse)(res, { attempts }, 200);
};
exports.getMyAttempts = getMyAttempts;
