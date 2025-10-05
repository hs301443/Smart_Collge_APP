import { Request, Response } from "express";
import { ExamModel } from "../../models/shema/Exam";
import { QuestionModel } from "../../models/shema/Exam";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { saveBase64Image } from "../../utils/handleImages";
import mongoose from "mongoose";

const allowedLevels = [1, 2, 3, 4, 5];
const allowedDepartments = ["CS", "IT", "IS", "CE", "EE"];

// ✅ إنشاء امتحان مع أسئلة (الأسئلة تنضاف في collection منفصلة)
export const createExamWithQuestions = async (req: any, res: Response) => {
  const adminId = req.user.id;
  const {
    title,
    description,
    doctorname,
    level,
    department,
    questions,
    subject_name,
    startAt,
    endAt,
    durationMinutes,
  } = req.body;

  if (
    !title || !description || !doctorname ||
    !level || !department || !subject_name ||
    !startAt || !endAt || !durationMinutes
  ) {
    throw new BadRequest("Please fill all the fields");
  }

  if (!allowedLevels.includes(Number(level))) throw new BadRequest("Invalid level");
  if (!allowedDepartments.includes(department)) throw new BadRequest("Invalid department");

  // إنشاء الامتحان أولًا
  const newExam = await ExamModel.create({
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
  const questionDocs: mongoose.Types.ObjectId[] = []; // ✅ التصليح هنا

  for (const q of questions) {
    const parsedChoices =
      Array.isArray(q.choices) && typeof q.choices[0] === "string"
        ? q.choices.map((c: string) => ({ text: c }))
        : Array.isArray(q.choices)
        ? q.choices
        : [];

    let imageUrl: string | null = null;
    if (q.imageBase64) {
      imageUrl = await saveBase64Image(q.imageBase64, adminId.toString(), req, "questions");
    }

    const question = await QuestionModel.create({
      exam: newExam._id,
      text: q.text,
      type: q.type,
      choices: parsedChoices,
      correctAnswer: q.correctAnswer,
      points: q.points,
      image: imageUrl,
    });

questionDocs.push(question._id as mongoose.Types.ObjectId);  }

  newExam.questions = questionDocs; // ✅ TypeScript خلاص راضي
  await newExam.save();
}
  SuccessResponse(res, { exam: newExam }, 201);
};

// ✅ جلب كل الامتحانات بدون الأسئلة
export const getAllExams = async (req: Request, res: Response) => {
  const exams = await ExamModel.find().select("-questions").sort({ createdAt: -1 });
  SuccessResponse(res, { exams }, 200);
};

// ✅ جلب امتحان محدد (بدون الأسئلة)
export const getExamById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new BadRequest("id is required");

  const exam = await ExamModel.findById(id).select("-questions");
  if (!exam) throw new NotFound("Exam not found");

  SuccessResponse(res, { exam }, 200);
};

// ✅ جلب أسئلة الامتحان
export const getAllQuestionsForExam = async (req: Request, res: Response) => {
  const { examId } = req.params;
  if (!examId) throw new BadRequest("examId is required");

  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFound("Exam not found");

  const questions = await QuestionModel.find({ exam: exam._id });
  SuccessResponse(res, { questions }, 200);
};

// ✅ جلب سؤال واحد
export const getQuestionById = async (req: Request, res: Response) => {
  const { questionId } = req.params;
  if (!questionId) throw new BadRequest("questionId is required");

  const question = await QuestionModel.findById(questionId);
  if (!question) throw new NotFound("Question not found");

  SuccessResponse(res, { question }, 200);
};

// ✅ حذف امتحان (مع حذف أسئلته)
export const deleteExam = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new BadRequest("id is required");

  const exam = await ExamModel.findById(id);
  if (!exam) throw new NotFound("Exam not found");

  await QuestionModel.deleteMany({ exam: id }); // حذف الأسئلة
  await exam.deleteOne();

  SuccessResponse(res, { message: "Exam and its questions deleted successfully" }, 200);
};

// ✅ تعديل بيانات امتحان
export const updateExam = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) throw new BadRequest("id is required");

  const exam = await ExamModel.findByIdAndUpdate(id, req.body, { new: true });
  if (!exam) throw new NotFound("Exam not found");

  SuccessResponse(res, { exam }, 200);
};

// ✅ تعديل سؤال
export const updateQuestionById = async (req: Request, res: Response) => {
  const { questionId } = req.params;
  if (!questionId) throw new BadRequest("questionId is required");

  const question = await QuestionModel.findByIdAndUpdate(questionId, req.body, { new: true });
  if (!question) throw new NotFound("Question not found");

  SuccessResponse(res, { question }, 200);
};

// ✅ حذف سؤال
export const deleteQuestionById = async (req: Request, res: Response) => {
  const { questionId } = req.params;
  if (!questionId) throw new BadRequest("questionId is required");

  const question = await QuestionModel.findByIdAndDelete(questionId);
  if (!question) throw new NotFound("Question not found");

  SuccessResponse(res, { message: "Question deleted successfully" }, 200);
};

// ✅ نشر / إلغاء نشر الامتحان
export const toggleExamPublish = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isPublished } = req.body;

  if (typeof isPublished !== "boolean") throw new BadRequest("isPublished must be boolean");

  const exam = await ExamModel.findByIdAndUpdate(id, { isPublished }, { new: true });
  if (!exam) throw new NotFound("Exam not found");

  SuccessResponse(
    res,
    { message: `Exam ${isPublished ? "published" : "unpublished"} successfully`, exam },
    200
  );
};
