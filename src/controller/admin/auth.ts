import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AdminModel, ActionModel } from "../../models/shema/auth/Admin";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequest("Email and password are required");
  }

  // ✅ جبنا الأدمن ومعاه الدور + الأكشنز
  const admin = await AdminModel.findOne({ email }).populate({
    path: "roleId",
    populate: { path: "actionIds", model: ActionModel },
  });

  if (!admin) {
    throw new NotFound("Admin not found");
  }

  // ✅ تحقق من الباسورد
  const isMatch = await bcrypt.compare(password, admin.hashedPassword);
  if (!isMatch) {
    throw new BadRequest("Invalid credentials");
  }

  // ✅ جهز بيانات الدور
  let roleData: any = null;
  if (admin.role === "SuperAdmin") {
    roleData = {
      id: null,
      name: "SuperAdmin",
      actions: [{ id: "*", name: "all" }],
    };
  } else if (admin.roleId) {
    roleData = {
      id: (admin.roleId as any)._id,
      name: (admin.roleId as any).name,
      actions: (admin.roleId as any).actionIds.map((a: any) => ({
        id: a._id,
        name: a.name,
      })),
    };
  }

  // ✅ التوكن: يشمل id, name, email, role (بدون تعقيد)
  const token = jwt.sign(
    {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,        // SuperAdmin / Admin
      roleId: admin.roleId?._id || null, // ObjectId أو null
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  // ✅ الريسبونس
  return SuccessResponse(res, {
    message: "Login successful",
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      roleId: admin.roleId?._id || null,
      actions: roleData?.actions || [],
    },
  });
};
