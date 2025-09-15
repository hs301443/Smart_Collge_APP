"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestionById = exports.updateQuestionById = exports.getAllQuestionById = exports.getAllQuestionsforExam = exports.createQuestionforExam = void 0;
const Questions_1 = require("../../models/shema/Questions");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const Errors_2 = require("../../Errors");
const response_1 = require("../../utils/response");
const createQuestionforExam = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    const { examId } = req.params;
    if (!examId)
        throw new BadRequest_1.BadRequest("examId is required");
    const { type, text, choices, correctAnswer, points, image } = req.body;
    if (!type || !text || !choices || !correctAnswer || !points)
        throw new BadRequest_1.BadRequest("data is required");
    const questionData = await Questions_1.QuestionModel.create({
        text,
        type,
        choices,
        correctAnswer,
        points,
        image: image || null,
        exam: examId
    });
    (0, response_1.SuccessResponse)(res, { questionData }, 200);
};
exports.createQuestionforExam = createQuestionforExam;
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
