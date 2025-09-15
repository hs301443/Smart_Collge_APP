"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAttempts = exports.submitAttempt = exports.saveAnswer = exports.startAttempt = void 0;
const Attempt_1 = require("../../models/shema/Attempt");
const Exam_1 = require("../../models/shema/Exam");
const Questions_1 = require("../../models/shema/Questions");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const multer_1 = require("../../utils/multer"); // 👈 استدعاء Multer
// ✅ 1. Start Attempt
const startAttempt = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { examId } = req.body;
    if (!examId)
        throw new BadRequest_1.BadRequest("Exam ID is required");
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    // Check if user already has attempt
    const existing = await Attempt_1.AttemptModel.findOne({
        exam: examId,
        student: req.user.id,
        status: { $ne: "graded" },
    });
    if (existing)
        throw new BadRequest_1.BadRequest("You already started this exam");
    const attempt = await Attempt_1.AttemptModel.create({
        exam: examId,
        student: req.user.id,
        answers: [],
        totalPoints: 0,
        status: "in-progress",
        startedAt: new Date(),
    });
    (0, response_1.SuccessResponse)(res, { attempt }, 201);
};
exports.startAttempt = startAttempt;
// ✅ Save Answer (while in-progress)
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
        const attempt = await Attempt_1.AttemptModel.findById(attemptId);
        if (!attempt)
            throw new Errors_1.NotFound("Attempt not found");
        if (attempt.student.toString() !== userId.toString()) {
            throw new Errors_1.UnauthorizedError("You are not allowed to modify this attempt");
        }
        if (attempt.status !== "in-progress") {
            throw new BadRequest_1.BadRequest("Attempt is already submitted");
        }
        const question = await Questions_1.QuestionModel.findById(questionId);
        if (!question)
            throw new Errors_1.NotFound("Question not found");
        // ملف الطالب مع رابط كامل
        const filePath = req.file
            ? `${req.protocol}://${req.get('host')}/uploads/answers/${req.file.filename}`
            : null;
        const existingAnswer = attempt.answers.find((a) => a.question.toString() === questionId);
        if (existingAnswer) {
            existingAnswer.answer = answer;
            if (filePath)
                existingAnswer.file = filePath;
        }
        else {
            attempt.answers.push({ question: questionId, answer, file: filePath });
        }
        await attempt.save();
        (0, response_1.SuccessResponse)(res, { attempt }, 200);
    });
};
exports.saveAnswer = saveAnswer;
// ✅ 3. Submit Attempt
const submitAttempt = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { attemptId } = req.body;
    if (!attemptId)
        throw new BadRequest_1.BadRequest("attemptId is required");
    const attempt = await Attempt_1.AttemptModel.findById(attemptId).populate("answers.question");
    if (!attempt)
        throw new Errors_1.NotFound("Attempt not found");
    if (attempt.student.toString() !== req.user.id.toString()) {
        throw new Errors_1.UnauthorizedError("You are not allowed to submit this attempt");
    }
    if (attempt.status !== "in-progress") {
        throw new BadRequest_1.BadRequest("Attempt already submitted or graded");
    }
    // Auto-grading simple questions
    let totalPoints = 0;
    for (const ans of attempt.answers) {
        const q = ans.question;
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
    (0, response_1.SuccessResponse)(res, { attempt }, 200);
};
exports.submitAttempt = submitAttempt;
// ✅ 4. Get My Attempts
const getMyAttempts = async (req, res) => {
    if (!req.user || !req.user.id)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const attempts = await Attempt_1.AttemptModel.find({ student: req.user.id })
        .populate("exam", "title subject_name level department")
        .populate("answers.question", "text type points");
    (0, response_1.SuccessResponse)(res, { attempts }, 200);
};
exports.getMyAttempts = getMyAttempts;
