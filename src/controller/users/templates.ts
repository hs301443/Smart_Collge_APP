import { TemplateModel } from "../../models/shema/templates";
import { Request, Response } from "express";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";




export const getTemplates = async (req: Request, res: Response) => {
        if (!req.user) throw new UnauthorizedError("Authentication required");
    const templates = await TemplateModel.find();
    return SuccessResponse(res, { templates });
};

export const getTemplateById = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const { id } = req.params;
    if (!id) throw new BadRequest("Template Id is required");
    const template = await TemplateModel.findById(id);
    if (!template) throw new NotFound("Template not found");
    return SuccessResponse(res, { template });
};
 