import { Request, Response } from "express";
import { AdminModel } from "../../models/shema/auth/Admin";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new UnauthorizedError("Email and password are required");
  }

  const admin = await AdminModel.findOne({ email }).populate("role");
  if (!admin) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, admin.hashedPassword);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // توليد التوكن يدويًا
  const token = jwt.sign(
    {
      sub: admin._id.toString(), 
      name: admin.name,
      role: (admin.role as any)?.name || null,
      isSuperAdmin: admin.isSuperAdmin
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return SuccessResponse(res, { 
    message: "Login successful", 
    token 
  }, 200);
};
