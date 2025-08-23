"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVisionMission = exports.updateVisionMission = exports.getVisionMissionById = exports.getVisionMission = exports.createVisionMission = void 0;
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const vision_mission_1 = require("../../models/shema/core/vision_mission");
const BadRequest_1 = require("../../Errors/BadRequest");
const handleImages_1 = require("../../utils/handleImages");
const Errors_2 = require("../../Errors");
const createVisionMission = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("You are not authorized to perform this action");
    const { title, description, imageBase64 } = req.body;
    if (!title || !description || !imageBase64)
        throw new BadRequest_1.BadRequest("Please fill all the fields");
    let imageUrl;
    if (imageBase64) {
        imageUrl = await (0, handleImages_1.saveBase64Image)(imageBase64, Date.now().toString(), req, "vision-mission");
    }
    const newVM = await vision_mission_1.VisionMissionModel.create({
        title,
        description,
        image: imageUrl,
    });
    (0, response_1.SuccessResponse)(res, "sucessfuly created");
};
exports.createVisionMission = createVisionMission;
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
const updateVisionMission = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("You are not authorized to perform this action");
    const { id } = req.params;
    const { title, description, imageBase64 } = req.body;
    const vm = await vision_mission_1.VisionMissionModel.findById(id);
    if (!vm)
        throw new Errors_2.NotFound("Vision & Mission not found");
    if (title)
        vm.title = title;
    if (description)
        vm.description = description;
    if (imageBase64) {
        vm.image = await (0, handleImages_1.saveBase64Image)(imageBase64, Date.now().toString(), req, "vision-mission");
    }
    await vm.save();
    (0, response_1.SuccessResponse)(res, "sucessfully updated");
};
exports.updateVisionMission = updateVisionMission;
const deleteVisionMission = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("You are not authorized to perform this action");
    const { id } = req.params;
    if (!id)
        throw new Errors_2.NotFound("Vision & Mission not found");
    const vm = await vision_mission_1.VisionMissionModel.findByIdAndDelete(id);
    (0, response_1.SuccessResponse)(res, "sucessfully deleted");
};
exports.deleteVisionMission = deleteVisionMission;
