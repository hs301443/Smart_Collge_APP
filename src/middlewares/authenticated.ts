import { verifyToken } from "../utils/auth";
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UnauthorizedError } from "../Errors/unauthorizedError";
import { UserModel } from "../models/shema/auth/User";
import { AdminModel } from "../models/shema/auth/Admin";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  role?: string;
}

export const authenticated = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (!decoded || !decoded.id) {
      throw new UnauthorizedError("Invalid token");
    }

    // ✅ الأول نحاول نلاقيه أدمن
    let user = await AdminModel.findById(decoded.id);

    // ✅ لو مش أدمن، نجرب نلاقيه يوزر
    if (!user) {
      user = await UserModel.findById(decoded.id);
    }

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // ✅ حطينا المستخدم/الأدمن في req
    (req as any).user = user;

    next();
  } catch (err) {
    next(new UnauthorizedError("Authentication failed"));
  }
};



