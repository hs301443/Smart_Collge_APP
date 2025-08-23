"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    purpose: { type: String },
    imagePath: { type: String },
    dateOfBirth: { type: Date, required: true },
    fcmtoken: { type: String },
    isVerified: { type: Boolean, default: false },
    rejectionReason: { type: String },
}, { timestamps: true });
exports.UserModel = mongoose_2.default.model('User', UserSchema);
