import { verifyToken } from "../utils/auth";
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UnauthorizedError } from "../Errors/unauthorizedError";


export function authenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Invalid Token");
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  req.user = decoded; // 👈 هنا TypeScript هيقبله بعد ما عرّفناه
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
