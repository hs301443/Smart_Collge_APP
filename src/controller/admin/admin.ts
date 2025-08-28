import { NewsModel } from "../../models/shema/News";
import { saveBase64Image } from "../../utils/handleImages";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { Request, Response } from "express";
 import bcrypt from "bcrypt";
import { AdminModel } from "../../models/shema/auth/Admin";


export const createAdmin = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create admins");
  }

  const { name, email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = new AdminModel({
    name,
    email,
    hashedPassword,
    role,
  });

  await admin.save();
  return SuccessResponse(res, { message: "Admin created", admin });
};
// ✅ Get All Admins
export const getAdmins = async (req: Request, res: Response) => {
    if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can delete admins");
  }
  const admins = await AdminModel.find().populate("role");
   if (!admins) throw new NotFound("Admins not found");
  return SuccessResponse(res, { admins });
};

// ✅ Get Single Admin
export const getAdminById = async (req: Request, res: Response) => {
    if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can delete admins");
  }
  const { id } = req.params;
  const admin = await AdminModel.findById(id).populate("role");
  if (!admin) throw new NotFound("Admin not found");
  return SuccessResponse(res, { admin });
};

// ✅ Update Admin
export const updateAdmin = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can update admins");
  }
 const { id } = req.params;
  const { name, email, password, role } = req.body;

  let updateData: any = { name, email, role };
  if (password) {
    updateData.hashedPassword = await bcrypt.hash(password, 10);
  }

  const admin = await AdminModel.findByIdAndUpdate(id, updateData, { new: true }).populate("role");
  if (!admin) throw new NotFound("Admin not found");

  return SuccessResponse(res, { message: "Admin updated", admin });
};

// ✅ Delete Admin
export const deleteAdmin = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can delete admins");
  }

  const { id } = req.params;
  const admin = await AdminModel.findByIdAndDelete(id);
  if (!admin) throw new NotFound("Admin not found");

  return SuccessResponse(res, { message: "Admin Deleted Successfully" });
};
