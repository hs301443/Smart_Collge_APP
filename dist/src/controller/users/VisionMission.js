"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisionMissionById = exports.getVisionMission = void 0;
const response_1 = require("../../utils/response");
const vision_mission_1 = require("../../models/shema/core/vision_mission");
const BadRequest_1 = require("../../Errors/BadRequest");
const getVisionMission = async (req, res) => {
    const vm = await vision_mission_1.VisionMissionModel.find();
    (0, response_1.SuccessResponse)(res, vm);
};
exports.getVisionMission = getVisionMission;
const getVisionMissionById = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("Please provide id");
    const vm = await vision_mission_1.VisionMissionModel.findById(id);
    (0, response_1.SuccessResponse)(res, vm);
};
exports.getVisionMissionById = getVisionMissionById;
