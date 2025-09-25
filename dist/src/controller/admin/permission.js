"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.getRoleById = exports.getRoles = exports.createRoleWithActions = void 0;
const Admin_1 = require("../../models/shema/auth/Admin");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
// ✅ إنشاء Role ومعاه Actions
const createRoleWithActions = async (req, res) => {
    const { roleName, actions } = req.body;
    if (!roleName || !actions || !Array.isArray(actions)) {
        throw new BadRequest_1.BadRequest("roleName and actions[] required");
    }
    // 1- إنشاء Actions جديدة
    const createdActions = await Admin_1.ActionModel.insertMany(actions.map((name) => ({ name })));
    // 2- إنشاء Role مربوط بالـ Actions
    const role = await Admin_1.RoleModel.create({
        name: roleName,
        actionIds: createdActions.map((a) => a._id),
    });
    (0, response_1.SuccessResponse)(res, {
        message: "Role created successfully",
        role,
        actions: createdActions,
    });
};
exports.createRoleWithActions = createRoleWithActions;
const getRoles = async (_req, res) => {
    const roles = await Admin_1.RoleModel.find().populate("actionIds");
    if (!roles)
        throw new Errors_1.NotFound("Roles not found");
    (0, response_1.SuccessResponse)(res, { roles });
};
exports.getRoles = getRoles;
const getRoleById = async (req, res) => {
    const { id } = req.params;
    const role = await Admin_1.RoleModel.findById(id).populate("actionIds");
    if (!role)
        throw new Errors_1.NotFound("Role not found");
    (0, response_1.SuccessResponse)(res, { role });
};
exports.getRoleById = getRoleById;
// ✅ تحديث Role (الاسم أو الـ actions)
const updateRole = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("Id is required");
    const { roleName, actions } = req.body;
    const role = await Admin_1.RoleModel.findById(id);
    if (!role)
        throw new Errors_1.NotFound("Role not found");
    if (roleName)
        role.name = roleName;
    if (actions && Array.isArray(actions)) {
        // إنشاء Actions جديدة
        const createdActions = await Admin_1.ActionModel.insertMany(actions.map((name) => ({ name })));
        role.actionIds = createdActions.map((a) => a._id);
    }
    await role.save();
    (0, response_1.SuccessResponse)(res, { message: "Role updated successfully", role });
};
exports.updateRole = updateRole;
// ✅ حذف Role
const deleteRole = async (req, res) => {
    const { id } = req.params;
    if (!id)
        throw new BadRequest_1.BadRequest("Id is required");
    const role = await Admin_1.RoleModel.findByIdAndDelete(id);
    if (!role)
        throw new Errors_1.NotFound("Role not found");
    (0, response_1.SuccessResponse)(res, { message: "Role deleted successfully" });
};
exports.deleteRole = deleteRole;
