import { Request, Response } from "express";
import { LevelModel } from "../../models/shema/level";
import { saveBase64Image } from "../../utils/handleImages";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

export const getLevels = async (req: Request, res: Response) => {
    const levels = await LevelModel.find();
      SuccessResponse(res, levels);
};

export const getLevelById = async (req: Request, res: Response) => {
    const level = await LevelModel.findById(req.params.id);
    if (!level) throw new NotFound("Level not found");
     SuccessResponse(res, level);
};