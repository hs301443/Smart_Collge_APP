"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const unauthorizedError_1 = require("../Errors/unauthorizedError");
const Admin_1 = require("../models/shema/auth/Admin");
/**
 * @param requiredRole اسم الدور المطلوب (زي: "NewsManager", "Editor")
 * @param requiredActions الصلاحيات المطلوبة (زي: "create", "update")
 */
const authorizeRoles = (requiredRole, ...requiredActions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next(new unauthorizedError_1.UnauthorizedError("User not authenticated"));
            }
            // ✅ 1- SuperAdmin يعدي دايمًا
            if (req.user.role === "SuperAdmin") {
                return next();
            }
            // ❌ 2- لو مش Admin ارفضه
            if (req.user.role !== "Admin") {
                return next(new unauthorizedError_1.UnauthorizedError("Access denied: Not an Admin"));
            }
            // ✅ 3- Admin لازم يكون عنده roleId
            if (!req.user.roleId) {
                return next(new unauthorizedError_1.UnauthorizedError("Admin role not assigned"));
            }
            // ✅ 4- هات الدور من DB + Populate actions
            const role = await Admin_1.RoleModel.findById(req.user.roleId).populate("actionIds");
            if (!role) {
                return next(new unauthorizedError_1.UnauthorizedError("Role not found"));
            }
            // ❌ 5- شيك على اسم الدور
            if (role.name !== requiredRole) {
                return next(new unauthorizedError_1.UnauthorizedError(`Only ${requiredRole} role can access this`));
            }
            // ✅ 6- استخرج الـ actions من role
            const userActions = role.actionIds.map((action) => action.name // هنا ممكن تعمل type للـ ActionModel
            );
            // ❌ 7- شيك على الصلاحيات المطلوبة
            const hasPermission = requiredActions.every((action) => userActions.includes(action));
            if (!hasPermission) {
                return next(new unauthorizedError_1.UnauthorizedError("You do not have the required permissions"));
            }
            // ✅ 8- لو عدى كل حاجة → كمل
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
exports.authorizeRoles = authorizeRoles;
