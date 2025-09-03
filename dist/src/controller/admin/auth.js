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
    // 🔹 البحث عن الأدمن ومعاه الدور
    const admin = await Admin_1.AdminModel.findOne({ email }).populate("role");
    if (!admin) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    // 🔹 التحقق من كلمة المرور
    const isPasswordValid = await bcrypt_1.default.compare(password, admin.hashedPassword);
    if (!isPasswordValid) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    // 🔹 تجهيز بيانات الصلاحيات
    const role = admin.role;
    const roleName = role ? role.name : null;
    const rolePermissions = role ? role.permissions : [];
    // 🔹 إنشاء الـ JWT
    const token = jsonwebtoken_1.default.sign({
        sub: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: roleName,
        isSuperAdmin: admin.isSuperAdmin,
        permissions: rolePermissions, // 🟢 إضافة الصلاحيات
    }, process.env.JWT_SECRET, { expiresIn: "7d" });
    // 🔹 رجع بيانات مفيدة للـ Frontend
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        token,
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: roleName,
            isSuperAdmin: admin.isSuperAdmin,
            permissions: rolePermissions,
        },
    }, 200);
};
exports.login = login;
