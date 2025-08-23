"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const unauthorizedError_1 = require("../Errors/unauthorizedError");
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new unauthorizedError_1.UnauthorizedError()); // لو مش موجود user
        }
        if (!roles.includes(req.user.role)) {
            return next(new unauthorizedError_1.UnauthorizedError()); // لو الدور مش متوافق
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
