import { Request, Response } from "express";
import { QuestionModel } from "../../models/shema/Questions";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { ExamModel } from "../../models/shema/Exam";

export const createQuestionForExam = async (req: any, res: any) => {
  if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  }

  const { text, type, choices, correctAnswer, points } = req.body;
  const { examId } = req.params;

  if (!examId) throw new BadRequest("examId is required");

  // التحقق من وجود الامتحان
  const exam = await ExamModel.findById(examId);
  if (!exam) throw new NotFound("Exam not found");

  // الصورة متخزنة في req.file
  const imagePath = req.file
    ? `${req.protocol}://${req.get('host')}/uploads/questions/${req.file.filename}`
    : null;

  // تحويل choices من نص JSON إلى array
  let parsedChoices: any[] = [];
  if (choices) {
    try {
      parsedChoices = JSON.parse(choices);
    } catch (err) {
      throw new BadRequest("Invalid JSON format for choices");
    }
  }

  // إنشاء السؤال
  const question = await QuestionModel.create({
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

  SuccessResponse(res, { question }, 201);
};
export const getAllQuestionsforExam =async(req:Request,res:Response)=>{
  if(!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError("Only Super Admin can create roles");
  const {examId}=req.params
  if(!examId) throw new BadRequest("examId is required")
  const questions=await QuestionModel.find({exam:examId})
  SuccessResponse(res, {questions}, 200);
}

export const getQuestionById = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin)
    throw new UnauthorizedError("Only Super Admin can view questions");

  const { questionid } = req.params;
  if (!questionid) throw new BadRequest("id is required");
  const question = await QuestionModel.findById(questionid).populate("exam", "title level department");
  if (!question) throw new NotFound("Question not found");

  SuccessResponse(res, { message: "Question found successfully",question }, 200);
};


export const updateQuestionById =async(req:Request,res:Response)=>{
  if(!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError("Only Super Admin can create roles");
  const {id}=req.params
  if(!id) throw new BadRequest("id is required")
  const question=await QuestionModel.findByIdAndUpdate(id,req.body,{new:true})
  if(!question) throw new NotFound("Question not found")
  SuccessResponse(res, {message:"Question updated successfully",question}, 200);
}

export const deleteQuestionById =async(req:Request,res:Response)=>{
  if(!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError("Only Super Admin can create roles");
  const {id}=req.params
  if(!id) throw new BadRequest("id is required")
  const question=await QuestionModel.findByIdAndDelete(id)
  if(!question) throw new NotFound("Question not found")
  SuccessResponse(res, {message:"Question deleted successfully"}, 200);
}
