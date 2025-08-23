"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatenotificationSchema = exports.createnotificationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createnotificationSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    body: joi_1.default.string().required(),
});
exports.updatenotificationSchema = joi_1.default.object({
    title: joi_1.default.string().optional(),
    body: joi_1.default.string().optional(),
});
