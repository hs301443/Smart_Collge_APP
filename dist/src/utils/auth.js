"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
// token.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const Errors_1 = require("../Errors");
dotenv_1.default.config();
const generateToken = (user, type) => {
    if (type === "admin") {
        return jsonwebtoken_1.default.sign({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role, // "Admin" أو "SuperAdmin"
            roleId: user.roleId?._id || null,
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
    }
    else {
        return jsonwebtoken_1.default.sign({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            userType: user.role === "Graduated" ? "Graduated" : "Student",
            level: user.level,
            department: user.department,
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
    }
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role || null, // للأدمن
            roleId: decoded.roleId || null, // للأدمن
            userType: decoded.userType || null, // لليوزر
            level: decoded.level || null,
            department: decoded.department || null,
        };
    }
    catch (error) {
        throw new Errors_1.UnauthorizedError("Invalid token");
    }
};
exports.verifyToken = verifyToken;
