import { verifyToken } from "../utils/auth";
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UnauthorizedError } from "../Errors/unauthorizedError";
import { UserModel } from "../models/shema/auth/User";

export async function authenticated(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Invalid Token");
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token); // بيرجع { id, role, name, ... }

  const user = await UserModel.findById(decoded.id);
  if (!user) throw new UnauthorizedError("User not found");

  req.user = user; // هنا هيكون فيه level و department
  next();
}



export const requireGraduated = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'Graduated') {
    return res.status(403).json({ 
      success: false, 
      message: 'Graduated user access required' 
    });
  }
  next();
};
