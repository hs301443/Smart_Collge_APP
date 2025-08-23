import { NextFunction, Request, Response, RequestHandler } from "express";
import { UnauthorizedError } from "../Errors/unauthorizedError";
import { AppUser } from "../types/custom"; // نوع المستخدم

// خلي الـ Request user اختياري
export interface AuthenticatedRequest extends Request {
  user?: AppUser;
}

export const authorizeRoles = (...roles: string[]): RequestHandler => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError()); // لو مش موجود user
    }

    if (!roles.includes(req.user.role)) {
      return next(new UnauthorizedError()); // لو الدور مش متوافق
    }

    next();
  };
};
