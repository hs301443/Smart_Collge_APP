"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const Admin_1 = require("../../models/shema/auth/Admin");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new Errors_1.UnauthorizedError("Email and password are required");
    }
    const admin = await Admin_1.AdminModel.findOne({ email }).populate("role");
    if (!admin) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, admin.hashedPassword);
    if (!isPasswordValid) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    // توليد التوكن يدويًا
    const token = jsonwebtoken_1.default.sign({
        sub: admin._id.toString(),
        name: admin.name,
        role: admin.role?.name || null,
        isSuperAdmin: admin.isSuperAdmin
    }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        token
    }, 200);
};
exports.login = login;
