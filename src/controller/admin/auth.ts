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

  // 🔹 البحث عن الأدمن ومعاه الدور
  const admin = await AdminModel.findOne({ email }).populate("role");
  if (!admin) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // 🔹 التحقق من كلمة المرور
  const isPasswordValid = await bcrypt.compare(password, admin.hashedPassword);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // 🔹 تجهيز بيانات الصلاحيات
  const role = admin.role as any;
  const roleName = role ? role.name : null;
  const rolePermissions = role ? role.permissions : [];

  // 🔹 إنشاء الـ JWT
  const token = jwt.sign(
    {
      sub: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: roleName,
      isSuperAdmin: admin.isSuperAdmin,
      permissions: rolePermissions, // 🟢 إضافة الصلاحيات
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  // 🔹 رجع بيانات مفيدة للـ Frontend
  return SuccessResponse(
    res,
    {
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: roleName,
        isSuperAdmin: admin.isSuperAdmin,
        permissions: rolePermissions,
      },
    },
    200
  );
};
