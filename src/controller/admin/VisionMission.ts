import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { Request, Response } from "express";
import { VisionMissionModel } from "../../models/shema/core/vision_mission";
import { BadRequest } from "../../Errors/BadRequest";
import {saveBase64Image} from "../../utils/handleImages";
import { NotFound } from "../../Errors";
export const createVisionMission = async (req: Request, res: Response) => {
    if(!req.user)
        throw new UnauthorizedError("You are not authorized to perform this action");
    const { title, description, imageBase64 } = req.body;
    if(!title || !description || !imageBase64)
        throw new BadRequest("Please fill all the fields");
             
    let imageUrl: string | undefined;
    if (imageBase64) {
      imageUrl = await saveBase64Image(imageBase64, Date.now().toString(), req, "vision-mission");
    }

    const newVM = await VisionMissionModel.create({
      title,
      description,
      image: imageUrl,
    });

    SuccessResponse(res, "sucessfuly created");
};

export const getVisionMission = async (req: Request, res: Response) => {
  if(!req.user)
        throw new UnauthorizedError("You are not authorized to perform this action");
    const vm = await VisionMissionModel.find();
    SuccessResponse(res, vm);
};

export const getVisionMissionById = async (req: Request, res: Response) => {
    if(!req.user)
       throw new UnauthorizedError("You are not authorized to perform this action");
    const { id } = req.params;
    if(!id)
        throw new BadRequest("Please provide id")
    const vm = await VisionMissionModel.findById(id);
    SuccessResponse(res, vm);
};

export const updateVisionMission = async (req: Request, res: Response) => {
    if(!req.user)
        throw new UnauthorizedError("You are not authorized to perform this action");

    const { id } = req.params;
    const { title, description, imageBase64 } = req.body;

    const vm = await VisionMissionModel.findById(id);
    if(!vm) throw new NotFound("Vision & Mission not found");

    if(title) vm.title = title;
    if(description) vm.description = description;
    if(imageBase64){
        vm.image = await saveBase64Image(imageBase64, Date.now().toString(), req, "vision-mission");
    }

    await vm.save();
    SuccessResponse(res, "sucessfully updated");
};


export const deleteVisionMission = async (req: Request, res: Response) => {
    if(!req.user)
        throw new UnauthorizedError("You are not authorized to perform this action");
      const { id } = req.params;
      if(!id)
        throw new NotFound("Vision & Mission not found")
      const vm = await VisionMissionModel.findByIdAndDelete(id);
    SuccessResponse(res,"sucessfully deleted");
};
