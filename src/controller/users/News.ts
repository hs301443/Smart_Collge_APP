import { NewsModel } from "../../models/shema/News";
import { saveBase64Image } from "../../utils/handleImages";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { Request, Response } from "express";

export const getallNews =async (req: Request, res: Response) => {
    if(!req.user)
    throw new UnauthorizedError("Not authorized to access this route")
    const news = await NewsModel.find();
    if(!news)
    throw new NotFound("No news found")
SuccessResponse(res,news)
};

export const getNewsById =async (req: Request, res: Response) => {
    if(!req.user)
    throw new UnauthorizedError("Not authorized to access this route")
    const id = req.params.id;
    if(!id)
    throw new BadRequest("Id is required")
    const news = await NewsModel.findById(id);
    if(!news)
    throw new NotFound("No news found")
SuccessResponse(res,news)
};
  