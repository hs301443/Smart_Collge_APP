import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { AdminModel } from "../../models/shema/auth/Admin";
import { SuccessResponse } from "../../utils/response";
import {  NotFound } from "../../Errors";
import { BadRequest } from "../../Errors/BadRequest";

// ✅ Create Admin
export const createAdmin = async (req: Request, res: Response) => {
  const { name, email, password, role, roleId } = req.body;

  const existing = await AdminModel.findOne({ email });
  if (existing) throw new BadRequest("Email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await AdminModel.create({
    name,
    email,
    hashedPassword,
    role,
    roleId,
  });

SuccessResponse(res, {message:"Admin created successfully", admin});
};

export const getAdmins = async (req: Request, res: Response) => {
  const admins = await AdminModel.find()
    .populate({
      path: "roleId",
      populate: { path: "actionIds" },
    })
    .lean();

  return SuccessResponse(res,{message:"Admins fetched successfully", admins});
};

// ✅ Get one admin with role + actions
export const getAdminById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const admin = await AdminModel.findById(id)
    .populate({
      path: "roleId",
      populate: { path: "actionIds" },
    })
    .lean();

  if (!admin) throw new NotFound("Admin not found");

  return SuccessResponse(res,  {message:"Admin fetched successfully", admin});
};

// ✅ Update Admin
export const updateAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role, roleId } = req.body;

  const admin = await AdminModel.findById(id);
  if (!admin) throw new NotFound("Admin not found");

  if (email && email !== admin.email) {
    const exists = await AdminModel.findOne({ email });
    if (exists) throw new BadRequest("Email already in use");
    admin.email = email;
  }

  if (password) {
    admin.hashedPassword = await bcrypt.hash(password, 10);
  }

  if (name) admin.name = name;
  if (role) admin.role = role;
  if (roleId) admin.roleId = roleId;

  await admin.save();

  return SuccessResponse(res, {message:"Admin updated successfully", admin});
};

// ✅ Delete Admin
export const deleteAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  const admin = await AdminModel.findByIdAndDelete(id);
  if (!admin) throw new NotFound("Admin not found");

  return SuccessResponse(res,  "Admin deleted successfully");
};
