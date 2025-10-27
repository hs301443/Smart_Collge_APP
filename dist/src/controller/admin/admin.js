"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdmin = exports.updateAdmin = exports.getAdminById = exports.getAdmins = exports.createAdmin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const Admin_1 = require("../../models/shema/auth/Admin");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
// ✅ Create Admin
const createAdmin = async (req, res) => {
    const { name, email, password, role, roleId } = req.body;
    const existing = await Admin_1.AdminModel.findOne({ email });
    if (existing)
        throw new BadRequest_1.BadRequest("Email already exists");
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const admin = await Admin_1.AdminModel.create({
        name,
        email,
        hashedPassword,
        role,
        roleId,
    });
    (0, response_1.SuccessResponse)(res, { message: "Admin created successfully", admin });
};
exports.createAdmin = createAdmin;
const getAdmins = async (req, res) => {
    const admins = await Admin_1.AdminModel.find()
        .populate({
        path: "roleId",
        populate: { path: "actionIds" },
    })
        .lean();
    return (0, response_1.SuccessResponse)(res, { message: "Admins fetched successfully", admins });
};
exports.getAdmins = getAdmins;
// ✅ Get one admin with role + actions
const getAdminById = async (req, res) => {
    const { id } = req.params;
    const admin = await Admin_1.AdminModel.findById(id)
        .populate({
        path: "roleId",
        populate: { path: "actionIds" },
    })
        .lean();
    if (!admin)
        throw new Errors_1.NotFound("Admin not found");
    return (0, response_1.SuccessResponse)(res, { message: "Admin fetched successfully", admin });
};
exports.getAdminById = getAdminById;
// ✅ Update Admin
const updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role, roleId } = req.body;
    const admin = await Admin_1.AdminModel.findById(id);
    if (!admin)
        throw new Errors_1.NotFound("Admin not found");
    if (email && email !== admin.email) {
        const exists = await Admin_1.AdminModel.findOne({ email });
        if (exists)
            throw new BadRequest_1.BadRequest("Email already in use");
        admin.email = email;
    }
    if (password) {
        admin.hashedPassword = await bcrypt_1.default.hash(password, 10);
    }
    if (name)
        admin.name = name;
    if (role)
        admin.role = role;
    if (roleId)
        admin.roleId = roleId;
    await admin.save();
    return (0, response_1.SuccessResponse)(res, { message: "Admin updated successfully", admin });
};
exports.updateAdmin = updateAdmin;
// ✅ Delete Admin
const deleteAdmin = async (req, res) => {
    const { id } = req.params;
    const admin = await Admin_1.AdminModel.findByIdAndDelete(id);
    if (!admin)
        throw new Errors_1.NotFound("Admin not found");
    return (0, response_1.SuccessResponse)(res, "Admin deleted successfully");
};
exports.deleteAdmin = deleteAdmin;
