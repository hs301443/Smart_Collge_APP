import { TemplateModel } from "../../models/shema/templates";
import { Request, Response } from "express";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";

export const createTemplate = async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const data = req.body;
   if (!data.title || !data.content || !data.category || !data.startdate || !data.enddate || !data.location) {
        throw new BadRequest("All fields are required");
    }
    const template = new TemplateModel({ ...data, user: req.user._id });    
    await template.save();
    return SuccessResponse(res, { message: "Template created" });
};

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

export const updateTemplate = async (req: Request, res: Response) => {
    if (!req.user ) throw new UnauthorizedError("Authentication required");
    const { id } = req.params;
    if (!id) throw new BadRequest("Template Id is required");
    const { title, content ,Image,category,startdate,enddate,location,IsActive} = req.body;
    const template = await TemplateModel.findById(id);
    if (!template) throw new NotFound("Template not found");
    if (title) template.title = title;
    if (content) template.content = content;
    if (Image) template.Image = Image;
    if (category) template.category = category;
    if (startdate) template.startdate = startdate;
    if (enddate) template.enddate = enddate;
    if (location) template.location = location;
    if (IsActive !== undefined) template.IsActive = IsActive;
    await template.save();
    return SuccessResponse(res, { message: "Template updated" });
}

export const deleteTemplate = async (req: Request, res: Response) => {
    if (!req.user ) throw new UnauthorizedError("Authentication required");
    const { id } = req.params;
    if (!id) throw new BadRequest("Template Id is required");
    const template = await TemplateModel.findById(id);
    if (!template) throw new NotFound("Template not found");
    await template.deleteOne();
    return SuccessResponse(res, { message: "Template deleted" });
}