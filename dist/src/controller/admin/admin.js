"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdmin = exports.updateAdmin = exports.getAdminById = exports.getAdmins = exports.createAdmin = void 0;
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const Errors_2 = require("../../Errors");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Admin_1 = require("../../models/shema/auth/Admin");
const createAdmin = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can create admins");
    }
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const admin = new Admin_1.AdminModel({
        name,
        email,
        hashedPassword,
        role,
    });
    await admin.save();
    return (0, response_1.SuccessResponse)(res, { message: "Admin created", admin });
};
exports.createAdmin = createAdmin;
// ✅ Get All Admins
const getAdmins = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can delete admins");
    }
    const admins = await Admin_1.AdminModel.find().populate("role");
    if (!admins)
        throw new Errors_1.NotFound("Admins not found");
    return (0, response_1.SuccessResponse)(res, { admins });
};
exports.getAdmins = getAdmins;
// ✅ Get Single Admin
const getAdminById = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can delete admins");
    }
    const { id } = req.params;
    const admin = await Admin_1.AdminModel.findById(id).populate("role");
    if (!admin)
        throw new Errors_1.NotFound("Admin not found");
    return (0, response_1.SuccessResponse)(res, { admin });
};
exports.getAdminById = getAdminById;
// ✅ Update Admin
const updateAdmin = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can update admins");
    }
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    let updateData = { name, email, role };
    if (password) {
        updateData.hashedPassword = await bcrypt_1.default.hash(password, 10);
    }
    const admin = await Admin_1.AdminModel.findByIdAndUpdate(id, updateData, { new: true }).populate("role");
    if (!admin)
        throw new Errors_1.NotFound("Admin not found");
    return (0, response_1.SuccessResponse)(res, { message: "Admin updated", admin });
};
exports.updateAdmin = updateAdmin;
// ✅ Delete Admin
const deleteAdmin = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can delete admins");
    }
    const { id } = req.params;
    const admin = await Admin_1.AdminModel.findByIdAndDelete(id);
    if (!admin)
        throw new Errors_1.NotFound("Admin not found");
    return (0, response_1.SuccessResponse)(res, { message: "Admin Deleted Successfully" });
};
exports.deleteAdmin = deleteAdmin;
