"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireGraduated = void 0;
exports.authenticated = authenticated;
const auth_1 = require("../utils/auth");
const unauthorizedError_1 = require("../Errors/unauthorizedError");
function authenticated(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new unauthorizedError_1.UnauthorizedError("Invalid Token");
    }
    const token = authHeader.split(" ")[1];
    const decoded = (0, auth_1.verifyToken)(token);
    req.user = decoded;
    next();
}
const requireGraduated = (req, res, next) => {
    if (req.user?.role !== 'Graduated') {
        return res.status(403).json({
            success: false,
            message: 'Graduated user access required'
        });
    }
    next();
};
exports.requireGraduated = requireGraduated;
