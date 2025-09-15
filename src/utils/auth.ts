import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UnauthorizedError } from "../Errors";

dotenv.config();

export const generateToken = (user: any): string => {
  return jwt.sign(
    { id: user.id?.toString(), role: user.role, name: user.name, level: user.level, department: user.department },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );
};


export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload;

    return {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
      level: decoded.level,
      department: decoded.department
    };
  } catch (error) {
    throw new UnauthorizedError("Invalid token");
  }
};
