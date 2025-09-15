"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExam = exports.deleteExam = exports.getExamById = exports.getAllExams = exports.createExam = void 0;
const Exam_1 = require("../../models/shema/Exam");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const Errors_2 = require("../../Errors");
const response_1 = require("../../utils/response");
const createExam = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const { title, description, doctorname, level, department, questions, subject_name, startAt, endAt, durationMinutes } = req.body;
    if (!title || !description || !doctorname || !level || !department || !questions || !subject_name || !startAt || !endAt || !durationMinutes)
        throw new BadRequest_1.BadRequest("Please fill all the fields");
    const newExam = await Exam_1.ExamModel.create({
        title,
        description,
        doctorname,
        level,
        department,
        questions,
        subject_name,
        startAt,
        endAt,
        durationMinutes
    });
    (0, response_1.SuccessResponse)(res, { newExam }, 201);
};
exports.createExam = createExam;
const getAllExams = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const exams = await Exam_1.ExamModel.find().populate("questions").sort({ createdAt: -1 });
    (0, response_1.SuccessResponse)(res, { exams }, 200);
};
exports.getAllExams = getAllExams;
const getExamById = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const exam = await Exam_1.ExamModel.findById(id).populate("questions");
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    (0, response_1.SuccessResponse)(res, { exam }, 200);
};
exports.getExamById = getExamById;
const deleteExam = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const exam = await Exam_1.ExamModel.findByIdAndDelete(id);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    (0, response_1.SuccessResponse)(res, { exam }, 200);
};
exports.deleteExam = deleteExam;
const updateExam = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const exam = await Exam_1.ExamModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    (0, response_1.SuccessResponse)(res, { exam }, 200);
};
exports.updateExam = updateExam;
