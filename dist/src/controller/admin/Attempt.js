"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttempt = exports.resetAttempt = exports.gradeAttempts = exports.getAttemptById = exports.getAttemptsByStudent = exports.getAttemptsByExam = void 0;
const Attempt_1 = require("../../models/shema/Attempt");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const Errors_2 = require("../../Errors");
const response_1 = require("../../utils/response");
// Get all attempts for an exam
const getAttemptsByExam = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can perform this action");
    const { examId } = req.params;
    if (!examId)
        throw new BadRequest_1.BadRequest("examId is required");
    const attempts = await Attempt_1.AttemptModel.find({ exam: examId })
        .populate("student", "name email")
        .populate("exam", "title");
    (0, response_1.SuccessResponse)(res, { attempts }, 200);
};
exports.getAttemptsByExam = getAttemptsByExam;
// Get all attempts for a student
const getAttemptsByStudent = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can perform this action");
    const { studentId } = req.params;
    if (!studentId)
        throw new BadRequest_1.BadRequest("studentId is required");
    const attempts = await Attempt_1.AttemptModel.find({ student: studentId })
        .populate("exam", "title")
        .populate("student", "name email");
    (0, response_1.SuccessResponse)(res, { attempts }, 200);
};
exports.getAttemptsByStudent = getAttemptsByStudent;
// Get single attempt by ID
const getAttemptById = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can perform this action");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const attempt = await Attempt_1.AttemptModel.findById(id)
        .populate("exam", "title")
        .populate("student", "name email")
        .populate("answers.question", "text type");
    if (!attempt)
        throw new Errors_1.NotFound("Attempt not found");
    (0, response_1.SuccessResponse)(res, { attempt }, 200);
};
exports.getAttemptById = getAttemptById;
// Manual grading
const gradeAttempts = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can perform this action");
    const { id } = req.params;
    const { answers } = req.body; // [{questionId, pointsAwarded}]
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const attempt = await Attempt_1.AttemptModel.findById(id);
    if (!attempt)
        throw new Errors_1.NotFound("Attempt not found");
    // Update answers grading
    answers.forEach((gradedAnswer) => {
        const answer = attempt.answers.find((a) => a.question.toString() === gradedAnswer.questionId);
        if (answer) {
            answer.pointsAwarded = gradedAnswer.pointsAwarded;
        }
    });
    // Recalculate total points
    attempt.totalPoints = attempt.answers.reduce((sum, a) => sum + (a.pointsAwarded || 0), 0);
    attempt.status = "graded";
    await attempt.save();
    (0, response_1.SuccessResponse)(res, { attempt }, 200);
};
exports.gradeAttempts = gradeAttempts;
// Reset attempt (reopen exam for student)
const resetAttempt = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can perform this action");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const attempt = await Attempt_1.AttemptModel.findById(id);
    if (!attempt)
        throw new Errors_1.NotFound("Attempt not found");
    attempt.status = "in-progress";
    attempt.submittedAt = null;
    attempt.answers = [];
    attempt.totalPoints = 0;
    await attempt.save();
    (0, response_1.SuccessResponse)(res, { message: "Attempt reset", attempt }, 200);
};
exports.resetAttempt = resetAttempt;
// Delete attempt
const deleteAttempt = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin)
        throw new Errors_2.UnauthorizedError("Only Super Admin can perform this action");
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const attempt = await Attempt_1.AttemptModel.findByIdAndDelete(id);
    if (!attempt)
        throw new Errors_1.NotFound("Attempt not found");
    (0, response_1.SuccessResponse)(res, { message: "Attempt deleted", attempt }, 200);
};
exports.deleteAttempt = deleteAttempt;
