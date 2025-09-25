import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UnauthorizedError } from "../Errors";

dotenv.config();

export const generateToken = (user: any, type: "admin" | "user"): string => {
  let userType: string;

  if (type === "admin") {
    // من جدول الأدمن
    userType = user.role === "SuperAdmin" ? "SuperAdmin" : "Admin";
  } else {
    // من جدول اليوزر
    userType = user.role === "Graduated" ? "Graduated" : "Student";
  }

  return jwt.sign(
    {
      id: user.id?.toString(),
      name: user.name,
      email: user.email,
      userType, // 👈 أضفنا الحقل ده
      level: user.level,
      department: user.department,
    },
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
      email: decoded.email,
      userType: decoded.userType, // 👈 هنا بترجع طالب / خريج / أدمن / سوبر أدمن
      level: decoded.level,
      department: decoded.department,
    };
  } catch (error) {
    throw new UnauthorizedError("Invalid token");
  }
};
