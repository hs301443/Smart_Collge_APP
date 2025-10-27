"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.updateProfileImage = exports.verifyEmail = exports.signup = exports.deleteProfile = exports.getProfile = exports.completeProfileStudent = exports.completeProfile = exports.resetPassword = exports.verifyResetCode = exports.sendResetCode = exports.getFcmToken = exports.login = void 0;
const emailVerifications_1 = require("../../models/shema/auth/emailVerifications");
const User_1 = require("../../models/shema/auth/User");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const response_1 = require("../../utils/response");
const crypto_1 = require("crypto");
const Errors_1 = require("../../Errors");
const auth_1 = require("../../utils/auth");
const sendEmails_1 = require("../../utils/sendEmails");
const BadRequest_1 = require("../../Errors/BadRequest");
const mongoose_1 = __importDefault(require("mongoose"));
const handleImages_1 = require("../../utils/handleImages");
// ✅ Login
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!password)
        throw new Errors_1.UnauthorizedError("Password is required");
    const user = await User_1.UserModel.findOne({ email });
    if (!user || !user.password)
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    if (!user.isVerified)
        throw new Errors_1.ForbiddenError("Verify your email first");
    const token = (0, auth_1.generateToken)(user, "user");
    // تجهيز بيانات المستخدم حسب الدور
    const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    if (user.role === "Student") {
        userData.level = user.level;
        userData.department = user.department;
    }
    (0, response_1.SuccessResponse)(res, {
        message: "Login Successful",
        token,
        user: userData,
    }, 200);
};
exports.login = login;
// ✅ Get FCM Token
const getFcmToken = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new Errors_1.UnauthorizedError("User not found");
    const user = await User_1.UserModel.findById(userId);
    if (!user)
        throw new Errors_1.NotFound("User not found");
    user.fcmtoken = req.body.token;
    await user.save();
    (0, response_1.SuccessResponse)(res, { message: "FCM token updated successfully" }, 200);
};
exports.getFcmToken = getFcmToken;
// ✅ Send Reset Code
const sendResetCode = async (req, res) => {
    const { email } = req.body;
    const user = await User_1.UserModel.findOne({ email });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    if (!user.isVerified)
        throw new BadRequest_1.BadRequest("User is not verified");
    const code = (0, crypto_1.randomInt)(100000, 999999).toString();
    await emailVerifications_1.EmailVerificationModel.deleteMany({ userId: user._id });
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await emailVerifications_1.EmailVerificationModel.create({ userId: user._id, verificationCode: code, expiresAt });
    await (0, sendEmails_1.sendEmail)(email, "Reset Password Code", `Hello ${user.name},

Your password reset code is: ${code}
(This code is valid for 2 hours)

Best regards,
Smart College Team`);
    (0, response_1.SuccessResponse)(res, { message: "Reset code sent to your email" }, 200);
};
exports.sendResetCode = sendResetCode;
// ✅ Verify Reset Code
const verifyResetCode = async (req, res) => {
    const { email, code } = req.body;
    const user = await User_1.UserModel.findOne({ email });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const record = await emailVerifications_1.EmailVerificationModel.findOne({ userId: user._id });
    if (!record)
        throw new BadRequest_1.BadRequest("No reset code found");
    if (record.verificationCode !== code)
        throw new BadRequest_1.BadRequest("Invalid code");
    if (record.expiresAt < new Date())
        throw new BadRequest_1.BadRequest("Code expired");
    (0, response_1.SuccessResponse)(res, { message: "Reset code verified successfully" }, 200);
};
exports.verifyResetCode = verifyResetCode;
// ✅ Reset Password
const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    const user = await User_1.UserModel.findOne({ email });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const record = await emailVerifications_1.EmailVerificationModel.findOne({ userId: user._id });
    if (!record)
        throw new BadRequest_1.BadRequest("No reset code found");
    user.password = await bcrypt_1.default.hash(newPassword, 10);
    await user.save();
    await emailVerifications_1.EmailVerificationModel.deleteOne({ userId: user._id });
    const token = (0, auth_1.generateToken)(user, "user");
    (0, response_1.SuccessResponse)(res, {
        message: "Password reset successfully",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            level: user.level,
            department: user.department,
        },
    }, 200);
};
exports.resetPassword = resetPassword;
// ✅ Complete Profile (Graduated)
const completeProfile = async (req, res) => {
    const { userId, role, graduatedData } = req.body;
    if (!role || !["Student", "Graduated"].includes(role))
        return res.status(400).json({ message: "Invalid role provided" });
    const user = await User_1.UserModel.findById(userId);
    if (!user)
        return res.status(404).json({ message: "User not found" });
    user.role = role;
    await user.save();
    if (role === "Graduated" && graduatedData) {
        let graduated = await User_1.GraduatedModel.findOne({ user: user._id });
        if (!graduated)
            graduated = await User_1.GraduatedModel.create({ user: user._id, ...graduatedData });
        else {
            Object.assign(graduated, graduatedData);
            await graduated.save();
        }
    }
    (0, response_1.SuccessResponse)(res, "complete profile successfully");
};
exports.completeProfile = completeProfile;
// ✅ Complete Profile (Student)
const completeProfileStudent = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not found");
    const { department, level } = req.body;
    if (!department)
        throw new BadRequest_1.BadRequest("department not provided");
    if (!level)
        throw new BadRequest_1.BadRequest("level not provided");
    const user = await User_1.UserModel.findById(req.user.id);
    if (!user)
        throw new Errors_1.NotFound("User not found");
    if (user.role !== "Student")
        throw new BadRequest_1.BadRequest("Only students can complete student profile");
    if (!user.isNew)
        throw new BadRequest_1.BadRequest("Profile already completed");
    user.department = department;
    user.level = level;
    user.isNew = false;
    await user.save();
    (0, response_1.SuccessResponse)(res, {
        message: "Profile completed successfully",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            level: user.level,
            department: user.department,
        },
    });
};
exports.completeProfileStudent = completeProfileStudent;
// ✅ Get Profile
const getProfile = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const user = await User_1.UserModel.findById(req.user.id).select("-password");
    if (!user)
        throw new Errors_1.NotFound("User not found");
    let graduated = null;
    if (user.role === "Graduated") {
        graduated = await User_1.GraduatedModel.findOne({ user: user._id });
    }
    (0, response_1.SuccessResponse)(res, { user, graduated }, 200);
};
exports.getProfile = getProfile;
// ✅ Delete Profile
const deleteProfile = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const user = await User_1.UserModel.findById(req.user.id);
    if (!user)
        throw new Errors_1.NotFound("User not found");
    if (user.role === "Graduated") {
        await User_1.GraduatedModel.findOneAndDelete({ user: user._id });
    }
    await user.deleteOne();
    (0, response_1.SuccessResponse)(res, { message: "User deleted successfully" }, 200);
};
exports.deleteProfile = deleteProfile;
// ✅ Signup (مع رفع الصورة إلى Cloudinary)
const signup = async (req, res) => {
    const { name, email, password, role, BaseImage64, graduatedData, level, department } = req.body;
    // 🧩 تحقق من وجود المستخدم مسبقًا
    const existing = await User_1.UserModel.findOne({ email });
    if (existing)
        throw new Errors_1.UniqueConstrainError("Email", "User already signed up with this email");
    // 🔒 تشفير الباسورد
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // 🖼️ رفع الصورة الشخصية (اختياري)
    let imageUrl = "";
    if (BaseImage64) {
        const imageData = BaseImage64.startsWith("data:")
            ? BaseImage64
            : `data:image/png;base64,${BaseImage64}`;
        imageUrl = await (0, handleImages_1.saveBase64Image)(imageData, "graduates/users", new mongoose_1.default.Types.ObjectId().toString());
    }
    // 🧾 إعداد بيانات المستخدم
    const userData = {
        name,
        email,
        password: hashedPassword,
        role,
        BaseImage64: imageUrl || null,
        isVerified: false,
        isNew: false,
    };
    if (role === "Student") {
        userData.level = level;
        userData.department = department;
    }
    const newUser = new User_1.UserModel(userData);
    await newUser.save();
    // 🎓 لو المستخدم خريج (Graduated)
    if (role === "Graduated") {
        let cvUrl = "";
        // 📎 رفع الـ CV لو الملف موجود
        if (req.file) {
            try {
                const result = await cloudinary_1.default.uploader.upload(req.file.path, {
                    folder: "graduates/cv",
                    resource_type: "raw", // لأن الملف PDF
                });
                cvUrl = result.secure_url;
            }
            catch (err) {
                console.error("Error uploading CV:", err);
            }
        }
        await User_1.GraduatedModel.create({
            user: newUser._id,
            name: newUser.name,
            email: newUser.email,
            BaseImage64: newUser.BaseImage64,
            cv: cvUrl || null,
            ...(graduatedData ? graduatedData : {}),
        });
    }
    // ✉️ إنشاء كود التفعيل وإرساله عبر البريد
    const code = (0, crypto_1.randomInt)(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await new emailVerifications_1.EmailVerificationModel({
        userId: newUser._id,
        verificationCode: code,
        expiresAt,
    }).save();
    await (0, sendEmails_1.sendEmail)(email, "Verify Your Email", `Hello ${name},
Your verification code is: ${code}
(This code is valid for 2 hours only)`);
    (0, response_1.SuccessResponse)(res, {
        message: "Signup successful, check your email for code",
        userId: newUser._id,
    }, 201);
};
exports.signup = signup;
// ✅ Verify Email
const verifyEmail = async (req, res) => {
    const { userId, code } = req.body;
    if (!userId || !code)
        throw new BadRequest_1.BadRequest("userId and code are required");
    const record = await emailVerifications_1.EmailVerificationModel.findOne({ userId });
    if (!record)
        throw new BadRequest_1.BadRequest("No verification record found");
    if (record.verificationCode !== code)
        throw new BadRequest_1.BadRequest("Invalid verification code");
    if (record.expiresAt < new Date())
        throw new BadRequest_1.BadRequest("Verification code expired");
    const user = await User_1.UserModel.findByIdAndUpdate(userId, { isVerified: true }, { new: true });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    await emailVerifications_1.EmailVerificationModel.deleteOne({ userId });
    const token = (0, auth_1.generateToken)(user, "user");
    (0, response_1.SuccessResponse)(res, { message: "Email verified successfully", token, user }, 200);
};
exports.verifyEmail = verifyEmail;
// ✅ Update Profile Image (Cloudinary)
const updateProfileImage = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not found");
    const { BaseImage64 } = req.body;
    if (!BaseImage64)
        throw new BadRequest_1.BadRequest("Image not provided");
    const user = await User_1.UserModel.findById(req.user.id);
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const imageData = BaseImage64.startsWith("data:")
        ? BaseImage64
        : `data:image/png;base64,${BaseImage64}`;
    const imageUrl = await (0, handleImages_1.saveBase64Image)(imageData, "graduates/profile_images", user._id.toString());
    user.BaseImage64 = imageUrl;
    await user.save();
    (0, response_1.SuccessResponse)(res, { message: "Profile image updated successfully", imageUrl }, 200);
};
exports.updateProfileImage = updateProfileImage;
const updateProfile = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { name, email, department, level, graduatedData } = req.body;
    const file = req.file; // 👈 multer هيسلم هنا ملف الـ CV
    const user = await User_1.UserModel.findById(req.user.id);
    if (!user)
        throw new Errors_1.NotFound("User not found");
    // 🧾 تعديل بيانات المستخدم
    if (name)
        user.name = name;
    if (email)
        user.email = email;
    // 👨‍🎓 لو طالب
    if (user.role === "Student") {
        if (department)
            user.department = department;
        if (level)
            user.level = level;
    }
    // 🎓 لو خريج
    if (user.role === "Graduated") {
        let graduated = await User_1.GraduatedModel.findOne({ user: user._id });
        if (!graduated) {
            graduated = new User_1.GraduatedModel({ user: user._id });
        }
        if (graduatedData && typeof graduatedData === "object") {
            Object.assign(graduated, graduatedData);
        }
        // 🗂️ لو فيه ملف CV مرفوع
        if (file) {
            try {
                const uploadResult = await cloudinary_1.default.uploader.upload(file.path, {
                    folder: "graduates/cv",
                    resource_type: "raw", // علشان Cloudinary يعرف إنه ملف PDF/Word مش صورة
                });
                graduated.cv = uploadResult.secure_url;
                fs_1.default.unlinkSync(file.path); // حذف النسخة المحلية بعد الرفع
            }
            catch (error) {
                console.error("Error uploading CV:", error);
            }
        }
        await graduated.save();
    }
    await user.save();
    // 📦 تجهيز الاستجابة
    const responseUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    if (user.role === "Student") {
        responseUser.department = user.department;
        responseUser.level = user.level;
    }
    if (user.role === "Graduated") {
        responseUser.graduatedData = await User_1.GraduatedModel.findOne({ user: user._id });
    }
    (0, response_1.SuccessResponse)(res, {
        message: "Profile updated successfully",
        user: responseUser,
    });
};
exports.updateProfile = updateProfile;
