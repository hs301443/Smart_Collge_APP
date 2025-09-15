"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAttempts = exports.submitExamAttempt = exports.startExamAttempt = exports.getExamByIdForStudent = exports.getExamsForStudent = void 0;
const Exam_1 = require("../../models/shema/Exam");
const Attempt_1 = require("../../models/shema/Attempt");
const Questions_1 = require("../../models/shema/Questions");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
// ✅ Get all exams for logged-in student (filtered by department & level)
const getExamsForStudent = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { level, department } = req.user;
    if (!level || !department)
        throw new BadRequest_1.BadRequest("User must have level and department");
    const exams = await Exam_1.ExamModel.find({ level, department });
    (0, response_1.SuccessResponse)(res, { exams }, 200);
};
exports.getExamsForStudent = getExamsForStudent;
// ✅ Get single exam by ID
const getExamByIdForStudent = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("Exam ID is required");
    const exam = await Exam_1.ExamModel.findById(id);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    if (exam.level !== req.user.level || exam.department !== req.user.department) {
        throw new Errors_1.UnauthorizedError("You are not allowed to access this exam");
    }
    (0, response_1.SuccessResponse)(res, { exam }, 200);
};
exports.getExamByIdForStudent = getExamByIdForStudent;
// ✅ Start an attempt for an exam
const startExamAttempt = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { examId } = req.body;
    if (!examId)
        throw new BadRequest_1.BadRequest("examId is required");
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    // Check if already attempted
    const existingAttempt = await Attempt_1.AttemptModel.findOne({
        exam: examId,
        student: req.user.id,
        status: { $ne: "graded" }, // لو لسه مش متصحح
    });
    if (existingAttempt) {
        throw new BadRequest_1.BadRequest("You already have an attempt for this exam");
    }
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
exports.startExamAttempt = startExamAttempt;
// ✅ Submit answers for an exam attempt
const submitExamAttempt = async (req, res) => {
    if (!req.user || !req.user.id) {
        throw new Errors_1.UnauthorizedError("User not authenticated");
    }
    const { attemptId, answers } = req.body; // answers = [{questionId, answer}]
    if (!attemptId || !answers)
        throw new BadRequest_1.BadRequest("attemptId and answers are required");
    const attempt = await Attempt_1.AttemptModel.findById(attemptId);
    if (!attempt)
        throw new Errors_1.NotFound("Attempt not found");
    if (attempt.student.toString() !== req.user.id.toString()) {
        throw new Errors_1.UnauthorizedError("You are not allowed to submit this attempt");
    }
    if (attempt.status !== "in-progress") {
        throw new BadRequest_1.BadRequest("This attempt is already submitted or graded");
    }
    // Check answers and auto-grade (for MCQ & True/False)
    let totalPoints = 0;
    for (const submittedAnswer of answers) {
        const question = await Questions_1.QuestionModel.findById(submittedAnswer.questionId);
        if (!question)
            continue;
        let pointsAwarded = 0;
        if ((question.type === "single-choice" ||
            question.type === "multiple-choice" ||
            question.type === "true-false" &&
                question.correctAnswer)) {
            // Auto-grading simple logic
            if (JSON.stringify(submittedAnswer.answer) === JSON.stringify(question.correctAnswer)) {
                pointsAwarded = question.points;
            }
        }
        attempt.answers.push({
            question: question._id,
            answer: submittedAnswer.answer,
            pointsAwarded,
        });
        totalPoints += pointsAwarded;
    }
    attempt.totalPoints = totalPoints;
    attempt.status = "submitted";
    attempt.submittedAt = new Date();
    await attempt.save();
    (0, response_1.SuccessResponse)(res, { attempt }, 200);
};
exports.submitExamAttempt = submitExamAttempt;
// ✅ Get student's own attempts
const getMyAttempts = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const attempts = await Attempt_1.AttemptModel.find({ student: req.user.id })
        .populate("exam", "title department level")
        .populate("answers.question", "text type");
    (0, response_1.SuccessResponse)(res, { attempts }, 200);
};
exports.getMyAttempts = getMyAttempts;
