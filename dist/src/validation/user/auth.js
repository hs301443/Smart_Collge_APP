"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.checkResetCodeSchema = exports.sendResetCodeSchema = exports.verifyEmailSchema = exports.loginSchema = exports.signupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.signupSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).max(50).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    role: joi_1.default.string().valid("Student", "Graduated").required(),
    imageBase64: joi_1.default.string().optional(),
    graduatedData: joi_1.default.object({
        cv: joi_1.default.string().optional(),
        employment_status: joi_1.default.string().valid("Employed", "Job Seeker", "Freelancer", "Postgraduate Studies").optional(),
        job_title: joi_1.default.string().optional(),
        company_location: joi_1.default.string().optional(),
        company_email: joi_1.default.string().optional(),
        company_link: joi_1.default.string().optional(),
        company_phone: joi_1.default.string().optional(),
        about_company: joi_1.default.string().optional(),
    }).optional()
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
});
exports.verifyEmailSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    code: joi_1.default.string().required(),
});
exports.sendResetCodeSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
});
exports.checkResetCodeSchema = joi_1.default.object({
    email: joi_1.default.string().required(),
    code: joi_1.default.string().required(),
});
exports.resetPasswordSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    newPassword: joi_1.default.string().min(6).max(30).required(),
});
