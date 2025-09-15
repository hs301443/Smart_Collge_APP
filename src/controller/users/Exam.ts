import { Request, Response } from "express";
import { ExamModel } from "../../models/shema/Exam";

import { BadRequest } from "../../Errors/BadRequest";
import { NotFound, UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

// ✅ Get all exams for logged-in student (filtered by department & level)
export const getExamsForStudent = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const level = req.user.level;
  const department = req.user.department;
  if (!level || !department) throw new BadRequest("User must have level and department");
  
  const exams = await ExamModel.find({ level, department });
  SuccessResponse(res, { exams }, 200);
};

// ✅ Get single exam by ID
export const getExamByIdForStudent = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const { id } = req.params;
  if (!id) throw new BadRequest("Exam ID is required");

  const exam = await ExamModel.findById(id);
  if (!exam) throw new NotFound("Exam not found");

  if (exam.level !== req.user.level || exam.department !== req.user.department) {
    throw new UnauthorizedError("You are not allowed to access this exam");
  }

  SuccessResponse(res, { exam }, 200);
};


