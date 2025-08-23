import {  Router } from "express";
import { authenticated } from "../../middlewares/authenticated";
import { createVisionMission, getVisionMission, getVisionMissionById, updateVisionMission, deleteVisionMission } from "../../controller/admin/VisionMission";
import { authorizeRoles } from "../../middlewares/authorized";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { visionMissionSchema, visionMissionUpdateSchema } from "../../validation/admin/VisionMission";
export const route = Router();

route.post('/',authenticated,authorizeRoles('admin'),validate(visionMissionSchema),catchAsync(createVisionMission))
route.get('/',authenticated,authorizeRoles('admin'),catchAsync(getVisionMission))
route.get('/:id',authenticated,authorizeRoles('admin'),catchAsync(getVisionMissionById))
route.put('/:id',authenticated,authorizeRoles('admin'),validate(visionMissionUpdateSchema),catchAsync(updateVisionMission))
route.delete('/:id',authenticated,authorizeRoles('admin'),catchAsync(deleteVisionMission))











export default route;