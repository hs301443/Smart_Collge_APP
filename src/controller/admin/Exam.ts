import { Request, Response } from "express";
import { ExamModel } from "../../models/shema/Exam";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { saveBase64Image } from "../../utils/handleImages";

const allowedLevels = [1, 2, 3, 4, 5];
const allowedDepartments = ["CS", "IT", "IS", "CE", "EE"];

// ✅ إنشاء امتحان مع أسئلة
export const createExamWithQuestions = async (req: any, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create exams");
  }

  const adminId = req.user.id;

  const {
    title,
    description,
    doctorname,
    level,
    department,
    questions, // Array of questions
    subject_name,
    startAt,
    endAt,
    durationMinutes
  } = req.body;

  if (!title || !description || !doctorname || !level || !department || !subject_name || !startAt || !endAt || !durationMinutes) {
    throw new BadRequest("Please fill all the fields");
  }

  if (!allowedLevels.includes(Number(level))) {
    throw new BadRequest("Invalid level");
  }

  if (!allowedDepartments.includes(department)) {
    throw new BadRequest("Invalid department");
  }

  // إنشاء الامتحان بدون أسئلة أولاً
  const newExam = await ExamModel.create({
    title,
    description,
    doctorname,
    level,
    department,
    questions: [],
    subject_name,
    startAt,
    endAt,
    durationMinutes
  });

  // إضافة الأسئلة مباشرة داخل Exam
  if (Array.isArray(questions) && questions.length > 0) {
    for (const q of questions) {
      let parsedChoices: any[] = [];
      if (Array.isArray(q.choices) && typeof q.choices[0] === "string") {
        parsedChoices = q.choices.map((c: string) => ({ text: c }));
      } else if (Array.isArray(q.choices)) {
        parsedChoices = q.choices;
      }

      let imageUrl: string | null = null;
      if (q.imageBase64) {
        imageUrl = await saveBase64Image(q.imageBase64, adminId.toString(), req, "questions");
      }

      // إضافة السؤال في المصفوفة مباشرة
      newExam.questions.push({
        text: q.text,
        type: q.type,
        choices: parsedChoices,
        correctAnswer: q.correctAnswer,
        points: q.points,
        image: imageUrl
      });
    }

    await newExam.save();
  }

  SuccessResponse(res, { exam: newExam }, 201);
};

// ✅ جلب كل الامتحانات
export const getAllExams = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError();
  const exams = await ExamModel.find().sort({ createdAt: -1 });
  SuccessResponse(res, { exams }, 200);
};

// ✅ جلب امتحان محدد
export const getExamById = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError();
  const { id } = req.params;
  if (!id) throw new BadRequest("id is required");

  const exam = await ExamModel.findById(id);
  if (!exam) throw new NotFound("Exam not found");
  SuccessResponse(res, { exam }, 200);
};

// ✅ حذف امتحان
export const deleteExam = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError();
  const { id } = req.params;
  if (!id) throw new BadRequest("id is required");

  const exam = await ExamModel.findByIdAndDelete(id);
  if (!exam) throw new NotFound("Exam not found");
  SuccessResponse(res, { message: "Exam deleted successfully" }, 200);
};

// ✅ تعديل امتحان
export const updateExam = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError();
  const { id } = req.params;
  if (!id) throw new BadRequest("id is required");

  const exam = await ExamModel.findByIdAndUpdate(id, req.body, { new: true });
  if (!exam) throw new NotFound("Exam not found");
  SuccessResponse(res, { exam }, 200);
};

// ✅ جلب كل أسئلة امتحان معين
export const getAllQuestionsForExam = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError();
  const { examId } = req.params;
  if (!examId) throw new BadRequest("examId is required");

  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFound("Exam not found");

  SuccessResponse(res, { questions: exam.questions }, 200);
};

// ✅ جلب سؤال واحد
export const getQuestionById = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError();
  const { examId, questionId } = req.params;
  if (!examId || !questionId) throw new BadRequest("examId and questionId are required");

  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFound("Exam not found");

  const question = exam.questions.id(questionId);
  if (!question) throw new NotFound("Question not found");

  SuccessResponse(res, { question }, 200);
};

// ✅ حذف سؤال
export const deleteQuestionById = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError();
  const { examId, questionId } = req.params;
  if (!examId || !questionId) throw new BadRequest("examId and questionId are required");

  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFound("Exam not found");

  const question = exam.questions.id(questionId);
  if (!question) throw new NotFound("Question not found");

  exam.questions.pull(questionId);
  await exam.save();
  SuccessResponse(res, { message: "Question deleted successfully" }, 200);
};

// ✅ تعديل سؤال
export const updateQuestionById = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError();
  const { examId, questionId } = req.params;
  if (!examId || !questionId) throw new BadRequest("examId and questionId are required");

  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFound("Exam not found");

  const question = exam.questions.id(questionId);
  if (!question) throw new NotFound("Question not found");

  question.set(req.body);
  await exam.save();

  SuccessResponse(res, { question }, 200);
};
