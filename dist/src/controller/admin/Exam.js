"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleExamPublish = exports.deleteQuestionById = exports.updateQuestionById = exports.updateExam = exports.deleteExam = exports.getQuestionById = exports.getAllQuestionsForExam = exports.getExamById = exports.getAllExams = exports.createExamWithQuestions = void 0;
const Exam_1 = require("../../models/shema/Exam");
const Exam_2 = require("../../models/shema/Exam");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const handleImages_1 = require("../../utils/handleImages");
const allowedLevels = [1, 2, 3, 4, 5];
const allowedDepartments = ["CS", "IT", "IS", "CE", "EE"];
// ✅ إنشاء امتحان مع أسئلة (الأسئلة تنضاف في collection منفصلة)
const createExamWithQuestions = async (req, res) => {
    const adminId = req.user.id;
    const { title, description, doctorname, level, department, questions, subject_name, startAt, endAt, durationMinutes, } = req.body;
    if (!title || !description || !doctorname ||
        !level || !department || !subject_name ||
        !startAt || !endAt || !durationMinutes) {
        throw new BadRequest_1.BadRequest("Please fill all the fields");
    }
    if (!allowedLevels.includes(Number(level)))
        throw new BadRequest_1.BadRequest("Invalid level");
    if (!allowedDepartments.includes(department))
        throw new BadRequest_1.BadRequest("Invalid department");
    // إنشاء الامتحان أولًا
    const newExam = await Exam_1.ExamModel.create({
        title,
        description,
        doctorname,
        level,
        department,
        subject_name,
        startAt,
        endAt,
        durationMinutes,
        questions: [],
        isPublished: false,
    });
    // 🧠 إنشاء الأسئلة في collection منفصلة
    // 🧠 إنشاء الأسئلة في collection منفصلة
    if (Array.isArray(questions) && questions.length > 0) {
        const questionDocs = []; // ✅ التصليح هنا
        for (const q of questions) {
            const parsedChoices = Array.isArray(q.choices) && typeof q.choices[0] === "string"
                ? q.choices.map((c) => ({ text: c }))
                : Array.isArray(q.choices)
                    ? q.choices
                    : [];
            let imageUrl = null;
            if (q.imageBase64) {
                imageUrl = await (0, handleImages_1.saveBase64Image)(q.imageBase64, adminId.toString(), req, "questions");
            }
            const question = await Exam_2.QuestionModel.create({
                exam: newExam._id,
                text: q.text,
                type: q.type,
                choices: parsedChoices,
                correctAnswer: q.correctAnswer,
                points: q.points,
                image: imageUrl,
            });
            questionDocs.push(question._id);
        }
        newExam.questions = questionDocs; // ✅ TypeScript خلاص راضي
        await newExam.save();
    }
    (0, response_1.SuccessResponse)(res, { exam: newExam }, 201);
};
exports.createExamWithQuestions = createExamWithQuestions;
// ✅ جلب كل الامتحانات بدون الأسئلة
const getAllExams = async (req, res) => {
    const exams = await Exam_1.ExamModel.find().select("-questions").sort({ createdAt: -1 });
    (0, response_1.SuccessResponse)(res, { exams }, 200);
};
exports.getAllExams = getAllExams;
// ✅ جلب امتحان محدد (بدون الأسئلة)
const getExamById = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const exam = await Exam_1.ExamModel.findById(id).select("-questions");
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    (0, response_1.SuccessResponse)(res, { exam }, 200);
};
exports.getExamById = getExamById;
// ✅ جلب أسئلة الامتحان
const getAllQuestionsForExam = async (req, res) => {
    const { examId } = req.params;
    if (!examId)
        throw new BadRequest_1.BadRequest("examId is required");
    const exam = await Exam_1.ExamModel.findById(examId);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    const questions = await Exam_2.QuestionModel.find({ exam: exam._id });
    (0, response_1.SuccessResponse)(res, { questions }, 200);
};
exports.getAllQuestionsForExam = getAllQuestionsForExam;
// ✅ جلب سؤال واحد
const getQuestionById = async (req, res) => {
    const { questionId } = req.params;
    if (!questionId)
        throw new BadRequest_1.BadRequest("questionId is required");
    const question = await Exam_2.QuestionModel.findById(questionId);
    if (!question)
        throw new Errors_1.NotFound("Question not found");
    (0, response_1.SuccessResponse)(res, { question }, 200);
};
exports.getQuestionById = getQuestionById;
// ✅ حذف امتحان (مع حذف أسئلته)
const deleteExam = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("id is required");
    const exam = await Exam_1.ExamModel.findById(id);
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    await Exam_2.QuestionModel.deleteMany({ exam: id }); // حذف الأسئلة
    await exam.deleteOne();
    (0, response_1.SuccessResponse)(res, { message: "Exam and its questions deleted successfully" }, 200);
};
exports.deleteExam = deleteExam;
// ✅ تعديل بيانات امتحان
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
// ✅ تعديل سؤال
const updateQuestionById = async (req, res) => {
    const { questionId } = req.params;
    if (!questionId)
        throw new BadRequest_1.BadRequest("questionId is required");
    const question = await Exam_2.QuestionModel.findByIdAndUpdate(questionId, req.body, { new: true });
    if (!question)
        throw new Errors_1.NotFound("Question not found");
    (0, response_1.SuccessResponse)(res, { question }, 200);
};
exports.updateQuestionById = updateQuestionById;
// ✅ حذف سؤال
const deleteQuestionById = async (req, res) => {
    const { questionId } = req.params;
    if (!questionId)
        throw new BadRequest_1.BadRequest("questionId is required");
    const question = await Exam_2.QuestionModel.findByIdAndDelete(questionId);
    if (!question)
        throw new Errors_1.NotFound("Question not found");
    (0, response_1.SuccessResponse)(res, { message: "Question deleted successfully" }, 200);
};
exports.deleteQuestionById = deleteQuestionById;
// ✅ نشر / إلغاء نشر الامتحان
const toggleExamPublish = async (req, res) => {
    const { id } = req.params;
    const { isPublished } = req.body;
    if (typeof isPublished !== "boolean")
        throw new BadRequest_1.BadRequest("isPublished must be boolean");
    const exam = await Exam_1.ExamModel.findByIdAndUpdate(id, { isPublished }, { new: true });
    if (!exam)
        throw new Errors_1.NotFound("Exam not found");
    (0, response_1.SuccessResponse)(res, { message: `Exam ${isPublished ? "published" : "unpublished"} successfully`, exam }, 200);
};
exports.toggleExamPublish = toggleExamPublish;
