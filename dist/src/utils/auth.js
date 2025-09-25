"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const Errors_1 = require("../Errors");
dotenv_1.default.config();
const generateToken = (user, type) => {
    let userType;
    if (type === "admin") {
        // من جدول الأدمن
        userType = user.role === "SuperAdmin" ? "SuperAdmin" : "Admin";
    }
    else {
        // من جدول اليوزر
        userType = user.role === "Graduated" ? "Graduated" : "Student";
    }
    return jsonwebtoken_1.default.sign({
        id: user.id?.toString(),
        name: user.name,
        email: user.email,
        userType, // 👈 أضفنا الحقل ده
        level: user.level,
        department: user.department,
    }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            userType: decoded.userType, // 👈 هنا بترجع طالب / خريج / أدمن / سوبر أدمن
            level: decoded.level,
            department: decoded.department,
        };
    }
    catch (error) {
        throw new Errors_1.UnauthorizedError("Invalid token");
    }
};
exports.verifyToken = verifyToken;
