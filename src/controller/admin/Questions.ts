import { Request, Response } from "express";
import { QuestionModel } from "../../models/shema/Questions";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

export const createQuestionforExam =async(req:Request,res:Response)=>{
  if(!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError("Only Super Admin can create roles");
  const {examId}=req.params
  if(!examId) throw new BadRequest("examId is required")
  const {type,text,choices,correctAnswer,points,image}=req.body
  if(!type||!text||!choices||!correctAnswer||!points) throw new BadRequest("data is required")
  const questionData=await QuestionModel.create({
text
,type
,choices
,correctAnswer
,points
,image:image||null
,exam:examId
})
  SuccessResponse(res, {questionData}, 200);
}

export const getAllQuestionsforExam =async(req:Request,res:Response)=>{
  if(!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError("Only Super Admin can create roles");
  const {examId}=req.params
  if(!examId) throw new BadRequest("examId is required")
  const questions=await QuestionModel.find({exam:examId})
  SuccessResponse(res, {questions}, 200);
}

export const getAllQuestionById =async(req:Request,res:Response)=>{
  if(!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError("Only Super Admin can create roles");
  const {id}=req.params
  if(!id) throw new BadRequest("id is required")
  const question=await QuestionModel.findById(id)
  if(!question) throw new NotFound("Question not found")
  SuccessResponse(res, {question}, 200);
}

export const updateQuestionById =async(req:Request,res:Response)=>{
  if(!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError("Only Super Admin can create roles");
  const {id}=req.params
  if(!id) throw new BadRequest("id is required")
  const question=await QuestionModel.findByIdAndUpdate(id,req.body,{new:true})
  if(!question) throw new NotFound("Question not found")
  SuccessResponse(res, {question}, 200);
}

export const deleteQuestionById =async(req:Request,res:Response)=>{
  if(!req.user || !req.user.isSuperAdmin) throw new UnauthorizedError("Only Super Admin can create roles");
  const {id}=req.params
  if(!id) throw new BadRequest("id is required")
  const question=await QuestionModel.findByIdAndDelete(id)
  if(!question) throw new NotFound("Question not found")
  SuccessResponse(res, {question}, 200);
}
