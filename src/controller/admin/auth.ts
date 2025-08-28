import { Request, Response } from "express";
import { AdminModel } from "../../models/shema/auth/Admin";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/auth";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";



export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1- تأكد من إن الحقول موجودة
  if (!email || !password) {
    throw new UnauthorizedError("Email and password are required");
  }

  // 2- شوف هل في admin بالـ email ده
  const admin = await AdminModel.findOne({ email });
  if (!admin) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // 3- قارن الباسورد مع الهاش اللي متخزن
  const isPasswordValid = await bcrypt.compare(password, admin.hashedPassword);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // 4- لو كله تمام → اعمل generate JWT
  const token = generateToken({
    id: admin._id,
    name: admin.name,
    role: admin.role,
  });

  // 5- رجّع response ناجح
  return SuccessResponse(res, { 
    message: "Login successful", 
    token 
  }, 200);
};