"use strict";
// import { NextFunction, Request, Response, RequestHandler } from "express";
// import { UnauthorizedError } from "../Errors/unauthorizedError";
// import { AppUser } from "../types/custom"; // نوع المستخدم
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.authorizePermissions = exports.authorizeRoles = void 0;
const unauthorizedError_1 = require("../Errors/unauthorizedError");
const Admin_1 = require("../models/shema/auth/Admin");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new unauthorizedError_1.UnauthorizedError("User not authenticated"));
        }
        if (req.user.isSuperAdmin) {
            return next();
        }
        // تحقق من الدور
        if (!req.user.role || !roles.includes(req.user.role)) {
            return next(new unauthorizedError_1.UnauthorizedError("You don't have permission"));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const authorizePermissions = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new unauthorizedError_1.UnauthorizedError("User not authenticated"));
        }
        if (req.user.isSuperAdmin) {
            return next();
        }
        const userPermissions = new Set([
            ...(req.user.rolePermissions || []),
            ...(req.user.customPermissions || []),
        ]);
        for (const perm of permissions) {
            if (!userPermissions.has(perm)) {
                return next(new unauthorizedError_1.UnauthorizedError(`Missing permission: ${perm}`));
            }
        }
        next();
    };
};
exports.authorizePermissions = authorizePermissions;
const auth = async (req, res, next) => {
    try {
        const token = (req.headers.authorization || "").replace("Bearer ", "");
        if (!token)
            return next(new unauthorizedError_1.UnauthorizedError("No token provided"));
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const admin = await Admin_1.AdminModel.findById(payload.sub).populate("role");
        if (!admin)
            return next(new unauthorizedError_1.UnauthorizedError("Admin not found"));
        req.user = {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: admin.role?.name || "admin",
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
