"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const Admin_1 = require("../../models/shema/auth/Admin");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../../utils/auth");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const login = async (req, res) => {
    const { email, password } = req.body;
    // 1- تأكد من إن الحقول موجودة
    if (!email || !password) {
        throw new Errors_1.UnauthorizedError("Email and password are required");
    }
    // 2- شوف هل في admin بالـ email ده
    const admin = await Admin_1.Adminmodel.findOne({ email });
    if (!admin) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    // 3- قارن الباسورد مع الهاش اللي متخزن
    const isPasswordValid = await bcrypt_1.default.compare(password, admin.hashedPassword);
    if (!isPasswordValid) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    // 4- لو كله تمام → اعمل generate JWT
    const token = (0, auth_1.generateToken)({
        id: admin._id,
        name: admin.name,
        role: admin.role,
    });
    // 5- رجّع response ناجح
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        token
    }, 200);
};
exports.login = login;
