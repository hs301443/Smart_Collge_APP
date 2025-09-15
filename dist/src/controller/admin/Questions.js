"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestionById = exports.updateQuestionById = exports.getAllQuestionById = exports.getAllQuestionsforExam = exports.createQuestionForExam = void 0;
const Questions_1 = require("../../models/shema/Questions");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const Errors_2 = require("../../Errors");
const response_1 = require("../../utils/response");
const Exam_1 = require("../../models/shema/Exam");
const createQuestionForExam = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const { text, type, choices, correctAnswer, points } = req.body;
    const { examId } = req.params;
    if (!examId)
        throw new BadRequest_1.BadRequest("examId is required");
    // التحقق من وجود الامتحان
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    // الصورة متخزنة في req.file
    const imagePath = req.file
        ? `${req.protocol}://${req.get('host')}/uploads/questions/${req.file.filename}`
        : null;
    // تحويل choices من نص JSON إلى array
    let parsedChoices = [];
    if (choices) {
        try {
            parsedChoices = JSON.parse(choices);
        }
        catch (err) {
            throw new BadRequest_1.BadRequest("Invalid JSON format for choices");
        }
    }
    // إنشاء السؤال
    const question = await Questions_1.QuestionModel.create({
        exam: examId,
        text,
        type,
        choices: parsedChoices,
        correctAnswer,
        points,
        image: imagePath
    });
    // ✅ ربط السؤال بالامتحان
    exam.questions.push(question._id);
    await exam.save();
    (0, response_1.SuccessResponse)(res, { question }, 201);
};
exports.createQuestionForExam = createQuestionForExam;
const getAllQuestionsforExam = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    const { examId } = req.params;
    if (!examId)
        throw new BadRequest_1.BadRequest("examId is required");
    const questions = await Questions_1.QuestionModel.find({ exam: examId });
    (0, response_1.SuccessResponse)(res, { questions }, 200);
};
exports.getAllQuestionsforExam = getAllQuestionsforExam;
const getAllQuestionById = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const question = await Questions_1.QuestionModel.findById(id);
    if (!question)
        throw new Errors_1.NotFound("Question not found");
    (0, response_1.SuccessResponse)(res, { question }, 200);
};
exports.getAllQuestionById = getAllQuestionById;
const updateQuestionById = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const question = await Questions_1.QuestionModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!question)
        throw new Errors_1.NotFound("Question not found");
    (0, response_1.SuccessResponse)(res, { question }, 200);
};
exports.updateQuestionById = updateQuestionById;
const deleteQuestionById = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const question = await Questions_1.QuestionModel.findByIdAndDelete(id);
    if (!question)
        throw new Errors_1.NotFound("Question not found");
    (0, response_1.SuccessResponse)(res, { question }, 200);
};
exports.deleteQuestionById = deleteQuestionById;
