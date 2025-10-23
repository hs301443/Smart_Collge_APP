"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuestionById = exports.deleteQuestionById = exports.getQuestionById = exports.getAllQuestionsForExam = exports.updateExam = exports.deleteExam = exports.getExamById = exports.getAllExams = exports.createExamWithQuestions = void 0;
const Exam_1 = require("../../models/shema/Exam");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const handleImages_1 = require("../../utils/handleImages");
const allowedLevels = [1, 2, 3, 4, 5];
const allowedDepartments = ["CS", "IT", "IS", "CE", "EE"];
// ✅ إنشاء امتحان مع أسئلة
const createExamWithQuestions = async (req, res) => {
    const adminId = req.user.id;
    const { title, description, doctorname, level, department, questions, // Array of questions
    subject_name, startAt, endAt, durationMinutes, } = req.body;
    if (!title ||
        !description ||
        !doctorname ||
        !level ||
        !department ||
        !subject_name ||
        !startAt ||
        !endAt ||
        !durationMinutes) {
        throw new BadRequest_1.BadRequest("Please fill all the fields");
    }
    if (!allowedLevels.includes(Number(level))) {
        throw new BadRequest_1.BadRequest("Invalid level");
    }
    if (!allowedDepartments.includes(department)) {
        throw new BadRequest_1.BadRequest("Invalid department");
    }
    // إنشاء الامتحان بدون أسئلة أولاً
    const newExam = await Exam_1.ExamModel.create({
        title,
        description,
        doctorname,
        level,
        department,
        questions: [],
        subject_name,
        startAt,
        endAt,
        durationMinutes,
    });
    // إضافة الأسئلة مباشرة داخل Exam
    if (Array.isArray(questions) && questions.length > 0) {
        for (const q of questions) {
            let parsedChoices = [];
            if (Array.isArray(q.choices) && typeof q.choices[0] === "string") {
                parsedChoices = q.choices.map((c) => ({ text: c }));
            }
            else if (Array.isArray(q.choices)) {
                parsedChoices = q.choices;
            }
            let imageUrl = null;
            if (q.imageBase64) {
                // ✅ تم تعديل الدالة لتستقبل 3 براميترز فقط
                imageUrl = await (0, handleImages_1.saveBase64Image)(q.imageBase64, adminId.toString(), "questions");
            }
            newExam.questions.push({
                text: q.text,
                type: q.type,
                choices: parsedChoices,
                correctAnswer: q.correctAnswer,
                points: q.points,
                image: imageUrl,
            });
        }
        await newExam.save();
    }
    (0, response_1.SuccessResponse)(res, { exam: newExam }, 201);
};
exports.createExamWithQuestions = createExamWithQuestions;
// ✅ جلب كل الامتحانات
const getAllExams = async (req, res) => {
    const exams = await Exam_1.ExamModel.find().sort({ createdAt: -1 });
    (0, response_1.SuccessResponse)(res, { exams }, 200);
};
exports.getAllExams = getAllExams;
// ✅ جلب امتحان محدد
const getExamById = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const exam = await Exam_1.ExamModel.findById(id);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    (0, response_1.SuccessResponse)(res, { exam }, 200);
};
exports.getExamById = getExamById;
// ✅ حذف امتحان
const deleteExam = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const exam = await Exam_1.ExamModel.findByIdAndDelete(id);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    (0, response_1.SuccessResponse)(res, { message: "Exam deleted successfully" }, 200);
};
exports.deleteExam = deleteExam;
// ✅ تعديل امتحان
const updateExam = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const exam = await Exam_1.ExamModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    (0, response_1.SuccessResponse)(res, { exam }, 200);
};
exports.updateExam = updateExam;
// ✅ جلب كل أسئلة امتحان معين
const getAllQuestionsForExam = async (req, res) => {
    const { examId } = req.params;
    if (!examId)
        throw new BadRequest_1.BadRequest("examId is required");
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    (0, response_1.SuccessResponse)(res, { questions: exam.questions }, 200);
};
exports.getAllQuestionsForExam = getAllQuestionsForExam;
// ✅ جلب سؤال واحد
const getQuestionById = async (req, res) => {
    const { examId, questionId } = req.params;
    if (!examId || !questionId)
        throw new BadRequest_1.BadRequest("examId and questionId are required");
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    const question = exam.questions.id(questionId);
    if (!question)
        throw new Errors_1.NotFound("Question not found");
    (0, response_1.SuccessResponse)(res, { question }, 200);
};
exports.getQuestionById = getQuestionById;
// ✅ حذف سؤال
const deleteQuestionById = async (req, res) => {
    const { examId, questionId } = req.params;
    if (!examId || !questionId)
        throw new BadRequest_1.BadRequest("examId and questionId are required");
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    const question = exam.questions.id(questionId);
    if (!question)
        throw new Errors_1.NotFound("Question not found");
    exam.questions.pull(questionId);
    await exam.save();
    (0, response_1.SuccessResponse)(res, { message: "Question deleted successfully" }, 200);
};
exports.deleteQuestionById = deleteQuestionById;
// ✅ تعديل سؤال
const updateQuestionById = async (req, res) => {
    const { examId, questionId } = req.params;
    if (!examId || !questionId)
        throw new BadRequest_1.BadRequest("examId and questionId are required");
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    const question = exam.questions.id(questionId);
    if (!question)
        throw new Errors_1.NotFound("Question not found");
    question.set(req.body);
    await exam.save();
    (0, response_1.SuccessResponse)(res, { question }, 200);
};
exports.updateQuestionById = updateQuestionById;
