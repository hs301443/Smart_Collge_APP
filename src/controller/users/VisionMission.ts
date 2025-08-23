import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { Request, Response } from "express";
import { VisionMissionModel } from "../../models/shema/core/vision_mission";
import { BadRequest } from "../../Errors/BadRequest";
import {saveBase64Image} from "../../utils/handleImages";
import { NotFound } from "../../Errors";

export const getVisionMission = async (req: Request, res: Response) => {
 
    const vm = await VisionMissionModel.find();
    SuccessResponse(res, vm);
};

export const getVisionMissionById = async (req: Request, res: Response) => {
    
    const { id } = req.params;
    if(!id)
        throw new BadRequest("Please provide id")
    const vm = await VisionMissionModel.findById(id);
    SuccessResponse(res, vm);
};



