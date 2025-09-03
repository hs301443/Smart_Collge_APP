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
    throw new UnauthorizedError("Only Super Admin can access admins");
  }

  // جلب الـ admins مع الدور، واستبعاد كلمة المرور
  const admins = await AdminModel.find()
    .populate("role")
    .select("-hashedPassword");

  if (admins.length === 0) throw new NotFound("Admins not found");

  // ترتيب الـ response
  const formattedAdmins = admins.map(admin => ({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    imagePath: admin.imagePath,
    isSuperAdmin: admin.isSuperAdmin,
    role: admin.role && typeof admin.role === "object" && "_id" in admin.role
      ? {
          _id: (admin.role as any)._id,
          name: (admin.role as any).name,
          permissions: (admin.role as any).permissions, // حقل الصلاحيات الصحيح
          description: (admin.role as any).description,
        }
      : null,
    customPermissions: admin.customPermissions,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  }));

  return SuccessResponse(res, { admins: formattedAdmins });
};


// ✅ Get Single Admin
export const getAdminById = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can access admins");
  }

  const { id } = req.params;
  const admin = await AdminModel.findById(id).populate("role").select("-hashedPassword");
  if (!admin) throw new NotFound("Admin not found");

  const formattedAdmin = {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    imagePath: admin.imagePath,
    isSuperAdmin: admin.isSuperAdmin,
    role: admin.role && typeof admin.role === "object" && "_id" in admin.role
      ? {
          _id: (admin.role as any)._id,
          name: (admin.role as any).name,
          permissions: (admin.role as any).permissions,
          description: (admin.role as any).description,
        }
      : null,
    customPermissions: admin.customPermissions,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };

  return SuccessResponse(res, { admin: formattedAdmin });
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

  const admin = await AdminModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate("role")
    .select("-hashedPassword");

  if (!admin) throw new NotFound("Admin not found");

  const formattedAdmin = {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    imagePath: admin.imagePath,
    isSuperAdmin: admin.isSuperAdmin,
    role: admin.role && typeof admin.role === "object" && "name" in admin.role
      ? {
          _id: (admin.role as any)._id,
          name: (admin.role as any).name,
          permissions: (admin.role as any).permissions,
          description: (admin.role as any).description,
        }
      : null,
    customPermissions: admin.customPermissions,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };

  return SuccessResponse(res, { message: "Admin updated", admin: formattedAdmin });
};

// ✅ Delete Admin
export const deleteAdmin = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can delete admins");
  }

  const { id } = req.params;
  const admin = await AdminModel.findByIdAndDelete(id);
  if (!admin) throw new NotFound("Admin not found");

  return SuccessResponse(res, { message: "Admin deleted successfully" });
};
