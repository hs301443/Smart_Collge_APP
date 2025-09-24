"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttempt = exports.updateAttempt = exports.getAttemptsByStudent = exports.getAttemptsByExam = exports.getAllAttempts = void 0;
const Attempt_1 = require("../../models/shema/Attempt");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
// ✅ جلب كل المحاولات
const getAllAttempts = async (req, res) => {
    const attempts = await Attempt_1.AttemptModel.find()
        .populate("student", "name email")
        .populate("exam", "title subject_name level department");
    (0, response_1.SuccessResponse)(res, { attempts }, 200);
};
exports.getAllAttempts = getAllAttempts;
// ✅ جلب محاولات امتحان معين
const getAttemptsByExam = async (req, res) => {
    const attempts = await Attempt_1.AttemptModel.find({ exam: req.params.examId })
        .populate("student", "name email")
        .populate("exam", "title subject_name");
    (0, response_1.SuccessResponse)(res, { attempts }, 200);
};
exports.getAttemptsByExam = getAttemptsByExam;
// ✅ جلب محاولات طالب معين
const getAttemptsByStudent = async (req, res) => {
    const attempts = await Attempt_1.AttemptModel.find({ student: req.params.studentId })
        .populate("exam", "title subject_name level department");
    (0, response_1.SuccessResponse)(res, { attempts }, 200);
};
exports.getAttemptsByStudent = getAttemptsByStudent;
// ✅ تعديل Attempt (مثلاً تغيير status أو totalPoints)
const updateAttempt = async (req, res) => {
    const attempt = await Attempt_1.AttemptModel.findByIdAndUpdate(req.params.attemptId, req.body, { new: true });
    if (!attempt)
        throw new Errors_1.NotFound("Attempt not found");
    (0, response_1.SuccessResponse)(res, { attempt }, 200);
};
exports.updateAttempt = updateAttempt;
// ✅ حذف Attempt
const deleteAttempt = async (req, res) => {
    const attempt = await Attempt_1.AttemptModel.findByIdAndDelete(req.params.attemptId);
    if (!attempt)
        throw new Errors_1.NotFound("Attempt not found");
    (0, response_1.SuccessResponse)(res, { message: "Attempt deleted successfully" }, 200);
};
exports.deleteAttempt = deleteAttempt;
