"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestionByIdForExam = exports.getQuestionsForExam = void 0;
const Exam_1 = require("../../models/shema/Exam");
const Questions_1 = require("../../models/shema/Questions");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
// 📌 Get questions of a specific exam (for logged-in student)
const getQuestionsForExam = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { examId } = req.params;
    if (!examId)
        throw new BadRequest_1.BadRequest("examId is required");
    // ✅ تأكد إن الامتحان موجود
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    // ✅ تأكد إن الامتحان يخص القسم والليفل بتوع الطالب
    if (exam.level !== req.user.level || exam.department !== req.user.department) {
        throw new Errors_1.UnauthorizedError("You are not allowed to access this exam");
    }
    // ✅ هات كل الأسئلة
    const questions = await Questions_1.QuestionModel.find({ exam: examId }).select("-correctAnswer");
    // 🔒 عشان الطالب ما يشوفش الحلول
    (0, response_1.SuccessResponse)(res, { examId, questions }, 200);
};
exports.getQuestionsForExam = getQuestionsForExam;
// 📌 Get a single question by ID (for logged-in student)
const getQuestionByIdForExam = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { examId, questionId } = req.params;
    if (!examId || !questionId)
        throw new BadRequest_1.BadRequest("examId and questionId are required");
    // ✅ تأكد إن الامتحان موجود
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    // ✅ تأكد إن الامتحان يخص القسم والليفل بتوع الطالب
    if (exam.level !== req.user.level || exam.department !== req.user.department) {
        throw new Errors_1.UnauthorizedError("You are not allowed to access this exam");
    }
    // ✅ هات السؤال
    const question = await Questions_1.QuestionModel.findOne({ _id: questionId, exam: examId }).select("-correctAnswer");
    if (!question)
        throw new Errors_1.NotFound("Question not found");
    (0, response_1.SuccessResponse)(res, { examId, question }, 200);
};
exports.getQuestionByIdForExam = getQuestionByIdForExam;
