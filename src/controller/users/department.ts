import { Request, Response } from "express";
import { DepartmentModel } from "../../models/shema/department";
import { saveBase64Image } from "../../utils/handleImages";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

export const getDepartments = async (req: Request, res: Response) => {
    
    const departments = await DepartmentModel.find();
      SuccessResponse(res, departments);
};

export const getDepartmentById = async (req: Request, res: Response) => {
    const department = await DepartmentModel.findById(req.params.id);
    if (!department) throw new NotFound("Department not found");
     SuccessResponse(res, department);
};
