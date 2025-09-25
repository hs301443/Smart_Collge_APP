import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UnauthorizedError } from "../Errors";

dotenv.config();

export const generateToken = (user: any, type: "admin" | "user"): string => {
  if (type === "admin") {
    // للأدمن
    return jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,             // "Admin" أو "SuperAdmin"
        roleId: user.roleId?._id || null,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );
  } else {
    // لليوزر
    return jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        userType: user.role === "Graduated" ? "Graduated" : "Student",
        level: user.level,
        department: user.department,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );
  }
};




export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role || null,        // للأدمن
      roleId: decoded.roleId || null,    // للأدمن
      userType: decoded.userType || null,// لليوزر
      level: decoded.level || null,
      department: decoded.department || null,
    };
  } catch (error) {
    throw new UnauthorizedError("Invalid token");
  }
};
