import { Request, Response } from "express";
import { ExamModel } from "../../models/shema/Exam";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

const allowedLevels = [1, 2, 3, 4, 5];
const allowedDepartments = ["CS", "IT", "IS", "CE", "EE"]; // عدل حسب الموديل الحقيقي

export const createExam = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create exams");
  }

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
    durationMinutes
  } = req.body;

  // التحقق من الحقول الأساسية
  if (!title || !description || !doctorname || !level || !department || !subject_name || !startAt || !endAt || !durationMinutes) {
    throw new BadRequest("Please fill all the fields");
  }

  // التحقق من level و department
  if (!allowedLevels.includes(Number(level))) {
    throw new BadRequest("Invalid level");
  }

  if (!allowedDepartments.includes(department)) {
    throw new BadRequest("Invalid department");
  }

  const newExam = await ExamModel.create({
    title,
    description,
    doctorname,
    level,
    department,
    questions: Array.isArray(questions) ? questions : [], // مصفوفة فارغة لو مفيش أسئلة
    subject_name,
    startAt,
    endAt,
    durationMinutes
  });

  SuccessResponse(res, { newExam }, 201);
};
export const getAllExams=async(req:Request, res:Response)=>{
     if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  } 
  const exams=await ExamModel.find().populate("questions").sort({createdAt:-1})
   SuccessResponse(res, {exams}, 200);
}

export const getExamById=async(req:Request, res:Response)=>{
     if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  } 
  const {id}=req.params
  if(!id) throw new BadRequest("id is required")
  const exam=await ExamModel.findById(id).populate("questions")
  if(!exam) throw new NotFound("Exam not found")
   SuccessResponse(res, {exam}, 200);
}

export const deleteExam=async(req:Request, res:Response)=>{
     if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  } 
  const {id}=req.params
  if(!id) throw new BadRequest("id is required")
  const exam=await ExamModel.findByIdAndDelete(id)
  if(!exam) throw new NotFound("Exam not found")
  SuccessResponse(res,  200);
}

export const updateExam=async(req:Request, res:Response)=>{
     if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  } 
  const {id}=req.params
  if(!id) throw new BadRequest("id is required")
  const exam=await ExamModel.findByIdAndUpdate(id,req.body,{new:true})
  if(!exam) throw new NotFound("Exam not found")
  SuccessResponse(res, {exam}, 200);
}
