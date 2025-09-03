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
        throw new Errors_2.UnauthorizedError("Only Super Admin can access admins");
    }
    // جلب الـ admins مع الدور، واستبعاد كلمة المرور
    const admins = await Admin_1.AdminModel.find()
        .populate("role")
        .select("-hashedPassword");
    if (admins.length === 0)
        throw new Errors_1.NotFound("Admins not found");
    // ترتيب الـ response
    const formattedAdmins = admins.map(admin => ({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        imagePath: admin.imagePath,
        isSuperAdmin: admin.isSuperAdmin,
        role: admin.role && typeof admin.role === "object" && "_id" in admin.role
            ? {
                _id: admin.role._id,
                name: admin.role.name,
                permissions: admin.role.permissions, // حقل الصلاحيات الصحيح
                description: admin.role.description,
            }
            : null,
        customPermissions: admin.customPermissions,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
    }));
    return (0, response_1.SuccessResponse)(res, { admins: formattedAdmins });
};
exports.getAdmins = getAdmins;
// ✅ Get Single Admin
const getAdminById = async (req, res) => {
    if (!req.user || !req.user.isSuperAdmin) {
        throw new Errors_2.UnauthorizedError("Only Super Admin can access admins");
    }
    const { id } = req.params;
    const admin = await Admin_1.AdminModel.findById(id).populate("role").select("-hashedPassword");
    if (!admin)
        throw new Errors_1.NotFound("Admin not found");
    const formattedAdmin = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        imagePath: admin.imagePath,
        isSuperAdmin: admin.isSuperAdmin,
        role: admin.role && typeof admin.role === "object" && "_id" in admin.role
            ? {
                _id: admin.role._id,
                name: admin.role.name,
                permissions: admin.role.permissions,
                description: admin.role.description,
            }
            : null,
        customPermissions: admin.customPermissions,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
    };
    return (0, response_1.SuccessResponse)(res, { admin: formattedAdmin });
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
    const admin = await Admin_1.AdminModel.findByIdAndUpdate(id, updateData, { new: true })
        .populate("role")
        .select("-hashedPassword");
    if (!admin)
        throw new Errors_1.NotFound("Admin not found");
    const formattedAdmin = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        imagePath: admin.imagePath,
        isSuperAdmin: admin.isSuperAdmin,
        role: admin.role && typeof admin.role === "object" && "name" in admin.role
            ? {
                _id: admin.role._id,
                name: admin.role.name,
                permissions: admin.role.permissions,
                description: admin.role.description,
            }
            : null,
        customPermissions: admin.customPermissions,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
    };
    return (0, response_1.SuccessResponse)(res, { message: "Admin updated", admin: formattedAdmin });
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
    return (0, response_1.SuccessResponse)(res, { message: "Admin deleted successfully" });
};
exports.deleteAdmin = deleteAdmin;
