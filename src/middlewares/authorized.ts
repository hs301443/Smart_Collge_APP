import { NextFunction, Request, Response, RequestHandler } from "express";
import { UnauthorizedError } from "../Errors/unauthorizedError";
import { RoleModel } from "../models/shema/auth/Admin";
import { AuthenticatedRequest } from "../types/custom"; // خلي النوع في ملف types

/**
 * @param requiredRole اسم الدور المطلوب (زي: "NewsManager", "Editor")
 * @param requiredActions الصلاحيات المطلوبة (زي: "create", "update")
 */
export const authorizeRoles = (
  requiredRole: string,
  ...requiredActions: string[]
): RequestHandler => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError("User not authenticated"));
      }

      // ✅ 1- SuperAdmin يعدي دايمًا
      if (req.user.role === "SuperAdmin") {
        return next();
      }

      // ❌ 2- لو مش Admin ارفضه
      if (req.user.role !== "Admin") {
        return next(new UnauthorizedError("Access denied: Not an Admin"));
      }

      // ✅ 3- Admin لازم يكون عنده roleId
      if (!req.user.roleId) {
        return next(new UnauthorizedError("Admin role not assigned"));
      }

      // ✅ 4- هات الدور من DB + Populate actions
      const role = await RoleModel.findById(req.user.roleId).populate("actionIds");
      if (!role) {
        return next(new UnauthorizedError("Role not found"));
      }

      // ❌ 5- شيك على اسم الدور
      if (role.name !== requiredRole) {
        return next(new UnauthorizedError(`Only ${requiredRole} role can access this`));
      }

      // ✅ 6- استخرج الـ actions من role
      const userActions = role.actionIds.map(
        (action: any) => action.name // هنا ممكن تعمل type للـ ActionModel
      );

      // ❌ 7- شيك على الصلاحيات المطلوبة
      const hasPermission = requiredActions.every((action) =>
        userActions.includes(action)
      );

      if (!hasPermission) {
        return next(
          new UnauthorizedError("You do not have the required permissions")
        );
      }

      // ✅ 8- لو عدى كل حاجة → كمل
      next();
    } catch (err) {
      next(err);
    }
  };
};
