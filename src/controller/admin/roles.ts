import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { Request, Response } from "express";
import { RoleModel } from "../../models/shema/auth/Admin";
// ✅ Create Role
export const createRole = async (req: Request, res: Response) => {

  if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can create roles");
  }

  const { name, permissions, description } = req.body;
  if (!name || !permissions) throw new BadRequest("Name and permissions are required");

  const role = new RoleModel({ name, permissions, description });
  await role.save();

  return SuccessResponse(res, { message: "Role Created Successfully", role });
};

export const getRoles = async (req: Request, res: Response) => {
     if (!req.user || (!req.user.isSuperAdmin && req.user.role == null)) {
    throw new UnauthorizedError("Admins only can view roles");
  }
    const roles = await RoleModel.find();
  return SuccessResponse(res, { roles });
};



// ✅ Get Role By Id
export const getRoleById = async (req: Request, res: Response) => {
     if (!req.user || (!req.user.isSuperAdmin && req.user.role == null)) {
    throw new UnauthorizedError("Admins only can view roles");
  }
  const { id } = req.params;
  const role = await RoleModel.findById(id);
  if (!role) throw new NotFound("Role not found");

  return SuccessResponse(res, { role });
};


// ✅ Update Role
export const updateRole = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can update roles");
  }

  const { id } = req.params;
  const { name, permissions, description } = req.body;

  const role = await RoleModel.findById(id);
  if (!role) throw new NotFound("Role not found");

  if (name) role.name = name;
  if (permissions) role.permissions = permissions;
  if (description) role.description = description;

  await role.save();

  return SuccessResponse(res, { message: "Role Updated Successfully", role });
};



export const deleteRole = async (req: Request, res: Response) => {
  if (!req.user || !req.user.isSuperAdmin) {
    throw new UnauthorizedError("Only Super Admin can delete roles");
  }

  const { id } = req.params;
  const role = await RoleModel.findByIdAndDelete(id);
  if (!role) throw new NotFound("Role not found");

  return SuccessResponse(res, { message: "Role Deleted Successfully" });
};


export const getMyRole = async (req: any, res: Response) => {
  if (!req.user?.role) {
    throw new NotFound("No role assigned to this admin");
  }
  const role = await RoleModel.findById(req.user.role);
  if (!role) throw new NotFound("Role not found");
  return SuccessResponse(res, { role });
};