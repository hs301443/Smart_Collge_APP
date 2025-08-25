"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNewsSchema = exports.createNewsSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createNewsSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(200).required(),
    content: joi_1.default.string().min(10).required(),
    mainImage: joi_1.default.string().uri().required(),
    images: joi_1.default.array().items(joi_1.default.string().uri()).default([]),
    optional: joi_1.default.array().items(joi_1.default.string().uri()).default([]),
    event_link: joi_1.default.string().uri().optional(),
    event_date: joi_1.default.date().optional(),
    type: joi_1.default.string().valid("news", "event", "announcement").required(),
});
exports.updateNewsSchema = joi_1.default.object({
    title: joi_1.default.string().min(3).max(200),
    content: joi_1.default.string().min(10),
    mainImage: joi_1.default.string().uri(),
    images: joi_1.default.array().items(joi_1.default.string().uri()),
    optional: joi_1.default.array().items(joi_1.default.string().uri()),
    event_link: joi_1.default.string().uri(),
    event_date: joi_1.default.date(),
    type: joi_1.default.string().valid("news", "event", "announcement"),
});
