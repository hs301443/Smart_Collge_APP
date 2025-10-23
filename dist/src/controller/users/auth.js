"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.updateProfileImage = exports.verifyEmail = exports.signup = exports.deleteProfile = exports.getProfile = exports.completeProfileStudent = exports.completeProfile = exports.resetPassword = exports.verifyResetCode = exports.sendResetCode = exports.getFcmToken = exports.login = void 0;
const emailVerifications_1 = require("../../models/shema/auth/emailVerifications");
const User_1 = require("../../models/shema/auth/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const response_1 = require("../../utils/response");
const crypto_1 = require("crypto");
const Errors_1 = require("../../Errors");
const auth_1 = require("../../utils/auth");
const sendEmails_1 = require("../../utils/sendEmails");
const BadRequest_1 = require("../../Errors/BadRequest");
const mongoose_1 = __importDefault(require("mongoose"));
const handleImages_1 = require("../../utils/handleImages");
// login.ts
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!password) {
        throw new Errors_1.UnauthorizedError("Password is required");
    }
    const user = await User_1.UserModel.findOne({ email });
    if (!user || !user.password) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    if (!user.isVerified) {
        throw new Errors_1.ForbiddenError("Verify your email first");
    }
    // ابعت user كامل مش object معمول له تعديل
    const token = (0, auth_1.generateToken)(user, "user");
    (0, response_1.SuccessResponse)(res, {
        message: "Login Successful",
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
exports.login = login;
const getFcmToken = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new Errors_1.UnauthorizedError("User not found");
    }
    const user = await User_1.UserModel.findById(userId);
    if (!user) {
        throw new Errors_1.NotFound("User not found");
    }
    user.fcmtoken = req.body.token;
    await user.save();
    (0, response_1.SuccessResponse)(res, { message: "FCM token updated successfully" }, 200);
};
exports.getFcmToken = getFcmToken;
const sendResetCode = async (req, res) => {
    const { email } = req.body;
    const user = await User_1.UserModel.findOne({ email });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    if (!user.isVerified)
        throw new BadRequest_1.BadRequest("User is not verified");
    const code = (0, crypto_1.randomInt)(100000, 999999).toString();
    // حذف أي كود موجود مسبقًا
    await emailVerifications_1.EmailVerificationModel.deleteMany({ userId: user._id });
    // إنشاء كود جديد
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // ساعتين
    await emailVerifications_1.EmailVerificationModel.create({
        userId: user._id,
        verificationCode: code,
        expiresAt,
    });
    await (0, sendEmails_1.sendEmail)(email, "Reset Password Code", `Hello ${user.name},

Your password reset code is: ${code}
(This code is valid for 2 hours)

Best regards,
Smart College Team`);
    (0, response_1.SuccessResponse)(res, { message: "Reset code sent to your email" }, 200);
};
exports.sendResetCode = sendResetCode;
// 2️⃣ التحقق من الكود
const verifyResetCode = async (req, res) => {
    const { email, code } = req.body;
    // ✅ 1. دور على اليوزر
    const user = await User_1.UserModel.findOne({ email });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const userId = user._id;
    // ✅ 2. دور على الكود باستخدام user._id
    const record = await emailVerifications_1.EmailVerificationModel.findOne({ userId });
    if (!record)
        throw new BadRequest_1.BadRequest("No reset code found");
    // ✅ 3. تحقق من الكود
    if (record.verificationCode !== code)
        throw new BadRequest_1.BadRequest("Invalid code");
    // ✅ 4. تحقق من الصلاحية
    if (record.expiresAt < new Date())
        throw new BadRequest_1.BadRequest("Code expired");
    // ✅ 5. رجّع رد النجاح
    (0, response_1.SuccessResponse)(res, { message: "Reset code verified successfully" }, 200);
};
exports.verifyResetCode = verifyResetCode;
// 3️⃣ إعادة تعيين كلمة المرور
const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    const user = await User_1.UserModel.findOne({ email });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const record = await emailVerifications_1.EmailVerificationModel.findOne({ userId: user._id });
    if (!record)
        throw new BadRequest_1.BadRequest("No reset code found");
    // تحديث الباسورد
    user.password = await bcrypt_1.default.hash(newPassword, 10);
    await user.save();
    // حذف سجل التحقق
    await emailVerifications_1.EmailVerificationModel.deleteOne({ userId: user._id });
    const token = (0, auth_1.generateToken)(user, "user");
    (0, response_1.SuccessResponse)(res, {
        message: "Login Successful",
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
const completeProfile = async (req, res) => {
    const { userId, role, graduatedData } = req.body;
    if (!role || !["Student", "Graduated"].includes(role)) {
        return res.status(400).json({ message: "Invalid role provided" });
    }
    const user = await User_1.UserModel.findById(userId);
    if (!user)
        return res.status(404).json({ message: "User not found" });
    user.role = role;
    await user.save();
    if (role === "Graduated" && graduatedData) {
        let graduated = await User_1.GraduatedModel.findOne({ user: user._id });
        if (!graduated) {
            graduated = await User_1.GraduatedModel.create({
                user: user._id,
                ...graduatedData,
            });
        }
        else {
            Object.assign(graduated, graduatedData);
            await graduated.save();
        }
    }
    const { password, ...userData } = user.toObject();
    (0, response_1.SuccessResponse)(res, "complete profile successfuly");
};
exports.completeProfile = completeProfile;
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
    if (user.role !== "Student") {
        throw new BadRequest_1.BadRequest("Only students can complete student profile");
    }
    // 🛑 تحقق إذا كان البروفايل مكتمل بالفعل
    if (!user.isNew) {
        throw new BadRequest_1.BadRequest("Profile already completed");
    }
    user.department = department;
    user.level = level;
    user.isNew = false;
    await user.save();
    return (0, response_1.SuccessResponse)(res, {
        message: "Profile completed successfully",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            level: user.level,
            department: user.department
        }
    });
};
exports.completeProfileStudent = completeProfileStudent;
// ✅ Get profile
const getProfile = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const user = await User_1.UserModel.findById(req.user.id).select("-password");
    if (!user)
        throw new Errors_1.NotFound("User not found");
    // لو المستخدم خريج → هات بياناته من GraduatedModel كمان
    let graduated = null;
    if (user.role === "Graduated") {
        graduated = await User_1.GraduatedModel.findOne({ user: user._id });
    }
    (0, response_1.SuccessResponse)(res, { user, graduated }, 200);
};
exports.getProfile = getProfile;
// ✅ Delete profile
const deleteProfile = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const user = await User_1.UserModel.findById(req.user.id);
    if (!user)
        throw new Errors_1.NotFound("User not found");
    // لو خريج → احذف بيانات الخريج كمان
    if (user.role === "Graduated") {
        await User_1.GraduatedModel.findOneAndDelete({ user: user._id });
    }
    await user.deleteOne();
    (0, response_1.SuccessResponse)(res, { message: "User deleted successfully" }, 200);
};
exports.deleteProfile = deleteProfile;
// ✅ Signup
const signup = async (req, res) => {
    const { name, email, password, role, BaseImage64, graduatedData, level, department } = req.body;
    const existing = await User_1.UserModel.findOne({ email });
    if (existing)
        throw new Errors_1.UniqueConstrainError("Email", "User already signed up with this email");
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    let imageUrl = "";
    if (BaseImage64) {
        imageUrl = await (0, handleImages_1.saveBase64Image)(BaseImage64, "users", new mongoose_1.default.Types.ObjectId().toString());
    }
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
    if (role === "Graduated" && graduatedData) {
        await User_1.GraduatedModel.create({
            user: newUser._id,
            name: newUser.name,
            email: newUser.email,
            BaseImage64: newUser.BaseImage64,
            ...graduatedData,
        });
    }
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
    (0, response_1.SuccessResponse)(res, { message: "Signup successful, check your email for code", userId: newUser._id }, 201);
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
    return (0, response_1.SuccessResponse)(res, { message: "Email verified successfully", token, user }, 200);
};
exports.verifyEmail = verifyEmail;
// ✅ Update profile image
const updateProfileImage = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not found");
    const { BaseImage64 } = req.body;
    if (!BaseImage64)
        throw new BadRequest_1.BadRequest("Image not provided");
    const user = await User_1.UserModel.findById(req.user.id);
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const imageUrl = await (0, handleImages_1.saveBase64Image)(BaseImage64, "profile_images", user._id.toString());
    user.BaseImage64 = imageUrl;
    await user.save();
    (0, response_1.SuccessResponse)(res, { message: "Profile image updated successfully", imageUrl }, 200);
};
exports.updateProfileImage = updateProfileImage;
// ✅ Update profile
const updateProfile = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("Unauthorized");
    const { name, BaseImage64, department, level, graduatedData } = req.body;
    const user = await User_1.UserModel.findById(req.user.id);
    if (!user)
        throw new Errors_1.NotFound("User not found");
    if (BaseImage64) {
        const imageUrl = await (0, handleImages_1.saveBase64Image)(BaseImage64, "users", user._id.toString());
        user.BaseImage64 = imageUrl;
    }
    if (name)
        user.name = name;
    if (department)
        user.department = department;
    if (level)
        user.level = level;
    if (user.role === "Graduated" && graduatedData) {
        const graduated = await User_1.GraduatedModel.findOne({ user: user._id });
        if (!graduated) {
            await User_1.GraduatedModel.create({ user: user._id, ...graduatedData });
        }
        else {
            Object.assign(graduated, graduatedData);
            await graduated.save();
        }
    }
    await user.save();
    (0, response_1.SuccessResponse)(res, { message: "Profile updated successfully", user }, 200);
};
exports.updateProfile = updateProfile;
