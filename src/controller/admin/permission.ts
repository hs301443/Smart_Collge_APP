import { Request, Response } from "express";
import { RoleModel, ActionModel } from "../../models/shema/auth/Admin";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";

// ✅ إنشاء Role ومعاه Actions
export const createRoleWithActions = async (req: Request, res: Response) => {
  
    const { roleName, actions } = req.body;

    if (!roleName || !actions || !Array.isArray(actions)) {
      throw new BadRequest(  "roleName and actions[] required" );
    }

    // 1- إنشاء Actions جديدة
    const createdActions = await ActionModel.insertMany(
      actions.map((name: string) => ({ name }))
    );

    // 2- إنشاء Role مربوط بالـ Actions
    const role = await RoleModel.create({
      name: roleName,
      actionIds: createdActions.map((a) => a._id),
    });

    SuccessResponse(res,{
      message: "Role created successfully",
      role,
      actions: createdActions,
    });
  } 

export const getRoles = async (_req: Request, res: Response) => {
    const roles = await RoleModel.find().populate("actionIds");
    if (!roles) throw new NotFound("Roles not found");
SuccessResponse(res, { roles });
} 

export const getRoleById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const role = await RoleModel.findById(id).populate("actionIds");
    if (!role) throw new NotFound("Role not found");
    SuccessResponse(res, { role });
}

// ✅ تحديث Role (الاسم أو الـ actions)
export const updateRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    if(!id) throw new BadRequest("Id is required");
    const { roleName, actions } = req.body;

    const role = await RoleModel.findById(id);
    if (!role) throw new NotFound( "Role not found" );

    if (roleName) role.name = roleName;

    if (actions && Array.isArray(actions)) {
      // إنشاء Actions جديدة
      const createdActions = await ActionModel.insertMany(
        actions.map((name: string) => ({ name }))
      );
      role.actionIds = createdActions.map((a) => a._id);
    }

    await role.save();

    SuccessResponse(res,{ message: "Role updated successfully", role });
  
};

// ✅ حذف Role
export const deleteRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    if(!id) throw new BadRequest("Id is required");

    const role = await RoleModel.findByIdAndDelete(id);
    if (!role) throw new NotFound( "Role not found" );

    SuccessResponse(res,{ message: "Role deleted successfully" });
  
};
