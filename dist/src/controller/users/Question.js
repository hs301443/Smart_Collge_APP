"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestionByIndex = exports.getQuestionByIdForStudent = exports.getQuestionsForExam = void 0;
const Questions_1 = require("../../models/shema/Questions");
const Exam_1 = require("../../models/shema/Exam");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
// ✅ Get all questions for an exam (without correct answers)
const getQuestionsForExam = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { examId } = req.params;
    if (!examId)
        throw new BadRequest_1.BadRequest("Exam ID is required");
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    // Check if exam belongs to student's department & level
    if (exam.level !== req.user.level || exam.department !== req.user.department) {
        throw new Errors_1.UnauthorizedError("You are not allowed to access this exam");
    }
    if (exam.isPublished == false) {
        throw new Errors_1.NotFound("exam is not published");
    }
    const questions = await Questions_1.QuestionModel.find({ exam: examId }).select("-correctAnswer" // hide correct answer
    ).populate("exam", "name title subject_name level department durationMinutes startAt endAt ");
    (0, response_1.SuccessResponse)(res, { questions }, 200);
};
exports.getQuestionsForExam = getQuestionsForExam;
// ✅ Get single question by ID (without correct answer)
const getQuestionByIdForStudent = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { questionId } = req.params;
    if (!questionId)
        throw new BadRequest_1.BadRequest("Question ID is required");
    const question = await Questions_1.QuestionModel.findById(questionId).select("-correctAnswer");
    if (!question)
        throw new Errors_1.NotFound("Question not found");
    (0, response_1.SuccessResponse)(res, { question }, 200);
};
exports.getQuestionByIdForStudent = getQuestionByIdForStudent;
// ✅ Get next/previous question (pagination style)
const getQuestionByIndex = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { examId, index } = req.params;
    if (!examId || index === undefined)
        throw new BadRequest_1.BadRequest("ExamId and index are required");
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    if (exam.level !== req.user.level || exam.department !== req.user.department) {
        throw new Errors_1.UnauthorizedError("You are not allowed to access this exam");
    }
    const questions = await Questions_1.QuestionModel.find({ exam: examId }).select("-correctAnswer");
    const idx = parseInt(index, 10);
    if (idx < 0 || idx >= questions.length)
        throw new Errors_1.NotFound("Invalid question index");
    const question = questions[idx];
    (0, response_1.SuccessResponse)(res, {
        question,
        index: idx,
        total: questions.length,
    }, 200);
};
exports.getQuestionByIndex = getQuestionByIndex;
