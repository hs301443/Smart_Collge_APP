"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExamByIdForStudent = exports.getExamsForStudent = void 0;
const Exam_1 = require("../../models/shema/Exam");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
// ✅ Get all exams for logged-in student (filtered by department & level)
const getExamsForStudent = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const level = req.user.level;
    const department = req.user.department;
    if (!level || !department)
        throw new BadRequest_1.BadRequest("User must have level and department");
    const exams = await Exam_1.ExamModel.find({ level, department }).select("-questions");
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
    if (exam.isPublished == false) {
        throw new Errors_1.UnauthorizedError("exam is not published");
    }
    (0, response_1.SuccessResponse)(res, { exam }, 200);
};
exports.getExamByIdForStudent = getExamByIdForStudent;
