"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticated = void 0;
const unauthorizedError_1 = require("../Errors/unauthorizedError");
const User_1 = require("../models/shema/auth/User");
const Admin_1 = require("../models/shema/auth/Admin");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticated = async (req, _res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new unauthorizedError_1.UnauthorizedError("No token provided");
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            throw new unauthorizedError_1.UnauthorizedError("Invalid token");
        }
        // ✅ الأول نحاول نلاقيه أدمن
        let user = await Admin_1.AdminModel.findById(decoded.id);
        // ✅ لو مش أدمن، نجرب نلاقيه يوزر
        if (!user) {
            user = await User_1.UserModel.findById(decoded.id);
        }
        if (!user) {
            throw new unauthorizedError_1.UnauthorizedError("User not found");
        }
        // ✅ حطينا المستخدم/الأدمن في req
        req.user = user;
        next();
    }
    catch (err) {
        next(new unauthorizedError_1.UnauthorizedError("Authentication failed"));
    }
};
exports.authenticated = authenticated;
