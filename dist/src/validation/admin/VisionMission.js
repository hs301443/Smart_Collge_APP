"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visionMissionUpdateSchema = exports.visionMissionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.visionMissionSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    imageBase64: joi_1.default.string().optional(),
});
exports.visionMissionUpdateSchema = joi_1.default.object({
    title: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
    imageBase64: joi_1.default.string().optional(),
});
