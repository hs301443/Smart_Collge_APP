"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = require("../../models/shema/auth/Admin");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequest_1.BadRequest("Email and password are required");
    }
    // ✅ جبنا الأدمن ومعاه الدور + الأكشنز
    const admin = await Admin_1.AdminModel.findOne({ email }).populate({
        path: "roleId",
        populate: { path: "actionIds", model: Admin_1.ActionModel },
    });
    if (!admin) {
        throw new Errors_1.NotFound("Admin not found");
    }
    // ✅ تحقق من الباسورد
    const isMatch = await bcrypt_1.default.compare(password, admin.hashedPassword);
    if (!isMatch) {
        throw new BadRequest_1.BadRequest("Invalid credentials");
    }
    // ✅ جهز بيانات الدور
    let role = null;
    if (admin.role === "SuperAdmin") {
        role = {
            id: null,
            name: "SuperAdmin",
            actions: [{ id: "*", name: "all" }],
        };
    }
    else if (admin.roleId) {
        role = {
            id: admin.roleId._id,
            name: admin.roleId.name,
            actions: admin.roleId.actionIds.map((a) => ({
                id: a._id,
                name: a.name,
            })),
        };
    }
    // ✅ التوكن
    const token = jsonwebtoken_1.default.sign({
        id: admin._id,
        role,
    }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // ✅ الريسبونس
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        token,
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        },
    });
};
exports.login = login;
