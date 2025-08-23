import {  Router } from "express";
import { getVisionMission, getVisionMissionById } from "../../controller/admin/VisionMission";
import { catchAsync } from "../../utils/catchAsync";

export const route = Router();

route.get('/',catchAsync(getVisionMission))
route.get('/:id',catchAsync(getVisionMissionById))











export default route;