"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLevel = exports.updateLevel = exports.createlevel = exports.getLevelById = exports.getLevels = void 0;
const level_1 = require("../../models/shema/level");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const getLevels = async (req, res) => {
    const levels = await level_1.LevelModel.find();
    (0, response_1.SuccessResponse)(res, levels);
};
exports.getLevels = getLevels;
const getLevelById = async (req, res) => {
    const level = await level_1.LevelModel.findById(req.params.id);
    if (!level)
        throw new Errors_1.NotFound("Level not found");
    (0, response_1.SuccessResponse)(res, level);
};
exports.getLevelById = getLevelById;
const createlevel = async (req, res) => {
    const { level_number, isActive } = req.body;
    const level = await level_1.LevelModel.create({ level_number, isActive });
    (0, response_1.SuccessResponse)(res, level);
};
exports.createlevel = createlevel;
const updateLevel = async (req, res) => {
    const level = await level_1.LevelModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!level)
        throw new Errors_1.NotFound("Level not found");
    (0, response_1.SuccessResponse)(res, level);
};
exports.updateLevel = updateLevel;
const deleteLevel = async (req, res) => {
    const level = await level_1.LevelModel.findByIdAndDelete(req.params.id);
    if (!level)
        throw new Errors_1.NotFound("Level not found");
    (0, response_1.SuccessResponse)(res, level);
};
exports.deleteLevel = deleteLevel;
