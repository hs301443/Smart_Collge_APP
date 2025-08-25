"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraduatedModel = exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, },
    phoneNumber: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    dateOfBirth: { type: Date, },
    fcmtoken: { type: String },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["Graduated", "Student"] }
}, { timestamps: true, });
exports.UserModel = mongoose_2.default.model('User', UserSchema);
const GraduatedSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Types.ObjectId, ref: "User", required: true, unique: true },
    cv: { type: String },
    employment_status: { type: String },
    job_title: { type: String },
    company_location: { type: String },
    company_email: { type: String },
    company_link: { type: String },
    company_phone: { type: String },
    about_company: { type: String },
}, { timestamps: true });
exports.GraduatedModel = mongoose_2.default.model('Graduated', GraduatedSchema);
