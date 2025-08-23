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
  req.user = decoded;
  next();
}




export const authenticateAdmin: RequestHandler = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    void res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid API key'
    });
    return; // مهم بعد void
  }

  next();
};
