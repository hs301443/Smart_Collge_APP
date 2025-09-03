"use strict";
// import { NextFunction, Request, Response, RequestHandler } from "express";
// import { UnauthorizedError } from "../Errors/unauthorizedError";
// import { AppUser } from "../types/custom"; // نوع المستخدم
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.authorizeRoles = void 0;
const unauthorizedError_1 = require("../Errors/unauthorizedError");
const Admin_1 = require("../models/shema/auth/Admin");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new unauthorizedError_1.UnauthorizedError("User not authenticated"));
        }
        // ✅ Super Admin يدخل من غير شروط
        if (req.user.isSuperAdmin) {
            return next();
        }
        // ✅ لو مفيش role أو الرول مش ضمن المسموح
        if (!req.user.role || !roles.includes(req.user.role)) {
            return next(new unauthorizedError_1.UnauthorizedError("You don't have permission"));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// export const authorizePermissions = (...permissions: string[]): RequestHandler => {
//   return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return next(new UnauthorizedError("User not authenticated"));
//     }
//     if (req.user.isSuperAdmin) {
//       return next();
//     }
//     const userPermissions = new Set([
//       ...(req.user.rolePermissions || []),
//       ...(req.user.customPermissions || []),
//     ]);
//     // ✅ لازم المستخدم يكون عنده كل البرميشنز المطلوبة
//     const missingPerms = permissions.filter((perm) => !userPermissions.has(perm));
//     if (missingPerms.length > 0) {
//       return next(new UnauthorizedError(`Missing permissions: ${missingPerms.join(", ")}`));
//     }
//     next();
//   };
// };
const auth = async (req, res, next) => {
    try {
        const token = (req.headers.authorization || "").replace("Bearer ", "");
        if (!token)
            return next(new unauthorizedError_1.UnauthorizedError("No token provided"));
        // ✅ التأكد من صحة التوكن واستخراج البيانات
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // ✅ البحث عن السوبر أدمن أو أي أدمن حسب الـ _id
        const admin = await Admin_1.AdminModel.findById(payload.sub).populate("role");
        if (!admin)
            return next(new unauthorizedError_1.UnauthorizedError("Admin not found"));
        // ✅ ملء معلومات المستخدم في req.user
        req.user = {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role?.name || null, // null لو مفيش role
            isSuperAdmin: admin.isSuperAdmin,
            customPermissions: admin.customPermissions || [],
            rolePermissions: admin.role?.permissions || [],
        };
        next();
    }
    catch (err) {
        next(new unauthorizedError_1.UnauthorizedError("Invalid or expired token"));
    }
};
exports.auth = auth;
