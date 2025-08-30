"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyRole = exports.deleteRole = exports.updateRole = exports.getRoleById = exports.getRoles = exports.createRole = void 0;
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const Errors_2 = require("../../Errors");
const Admin_1 = require("../../models/shema/auth/Admin");
// ✅ Create Role
const createRole = async (req, res) => {
    console.log("👤 Inside createRole, user:", req.user);
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create roles");
    }
    const { name, permissions, description } = req.body;
    if (!name || !permissions)
        throw new BadRequest_1.BadRequest("Name and permissions are required");
    const role = new Admin_1.RoleModel({ name, permissions, description });
    await role.save();
    return (0, response_1.SuccessResponse)(res, { message: "Role Created Successfully", role });
};
exports.createRole = createRole;
const getRoles = async (req, res) => {
    if (!req.user || (!req.user.isSuperAdmin && req.user.role == null)) {
        throw new Errors_2.UnauthorizedError("Admins only can view roles");
    }
    const roles = await Admin_1.RoleModel.find();
    return (0, response_1.SuccessResponse)(res, { roles });
};
exports.getRoles = getRoles;
// ✅ Get Role By Id
const getRoleById = async (req, res) => {
    if (!req.user || (!req.user.isSuperAdmin && req.user.role == null)) {
        throw new Errors_2.UnauthorizedError("Admins only can view roles");
    }
    const { id } = req.params;
    const role = await Admin_1.RoleModel.findById(id);
    if (!role)
        throw new Errors_1.NotFound("Role not found");
    return (0, response_1.SuccessResponse)(res, { role });
};
exports.getRoleById = getRoleById;
// ✅ Update Role
const updateRole = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can update roles");
    }
    const { id } = req.params;
    const { name, permissions, description } = req.body;
    const role = await Admin_1.RoleModel.findById(id);
    if (!role)
        throw new Errors_1.NotFound("Role not found");
    if (name)
        role.name = name;
    if (permissions)
        role.permissions = permissions;
    if (description)
        role.description = description;
    await role.save();
    return (0, response_1.SuccessResponse)(res, { message: "Role Updated Successfully", role });
};
exports.updateRole = updateRole;
const deleteRole = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can delete roles");
    }
    const { id } = req.params;
    const role = await Admin_1.RoleModel.findByIdAndDelete(id);
    if (!role)
        throw new Errors_1.NotFound("Role not found");
    return (0, response_1.SuccessResponse)(res, { message: "Role Deleted Successfully" });
};
exports.deleteRole = deleteRole;
const getMyRole = async (req, res) => {
    if (!req.user?.role) {
        throw new Errors_1.NotFound("No role assigned to this admin");
    }
    const role = await Admin_1.RoleModel.findById(req.user.role);
    if (!role)
        throw new Errors_1.NotFound("Role not found");
    return (0, response_1.SuccessResponse)(res, { role });
};
exports.getMyRole = getMyRole;
