"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
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
const authenticateAdmin = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        void res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid API key'
        });
        return; // مهم بعد void
    }
    next();
};
exports.authenticateAdmin = authenticateAdmin;
