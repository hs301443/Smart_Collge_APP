"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileImage = exports.completeProfile = exports.resetPassword = exports.verifyResetCode = exports.sendResetCode = exports.getFcmToken = exports.login = exports.verifyEmail = exports.signup = void 0;
const handleImages_1 = require("../../utils/handleImages");
const emailVerifications_1 = require("../../models/shema/auth/emailVerifications");
const User_1 = require("../../models/shema/auth/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const response_1 = require("../../utils/response");
const crypto_1 = require("crypto");
const Errors_1 = require("../../Errors");
const auth_1 = require("../../utils/auth");
const sendEmails_1 = require("../../utils/sendEmails");
const BadRequest_1 = require("../../Errors/BadRequest");
const mongoose_1 = require("mongoose");
const signup = async (req, res) => {
    const { name, email, password, role, BaseImage64, graduatedData } = req.body;
    // التحقق من وجود المستخدم مسبقًا
    const existing = await User_1.UserModel.findOne({ email });
    if (existing)
        throw new Errors_1.UniqueConstrainError("Email", "User already signed up with this email");
    // تشفير الباسورد
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // إعداد البيانات العامة للمستخدم
    const userData = {
        name,
        email,
        password: hashedPassword,
        role,
        BaseImage64: BaseImage64 || null,
        isVerified: false,
    };
    // إنشاء الـ User أولًا
    const newUser = new User_1.UserModel(userData);
    await newUser.save();
    // لو الدور Graduated أضف بيانات التخرج في جدول Graduated منفصل
    if (role === "Graduated" && graduatedData) {
        await User_1.GraduatedModel.create({
            user: newUser._id, // ربط بالـ User
            name: newUser.name,
            email: newUser.email,
            BaseImage64: newUser.BaseImage64,
            cv: graduatedData.cv || null,
            employment_status: graduatedData.employment_status || null,
            job_title: graduatedData.job_title || null,
            company_location: graduatedData.company_location || null,
            company_email: graduatedData.company_email || null,
            company_link: graduatedData.company_link || null,
            company_phone: graduatedData.company_phone || null,
            about_company: graduatedData.about_company || null,
        });
    }
    // إنشاء كود التحقق
    const code = (0, crypto_1.randomInt)(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    await new emailVerifications_1.EmailVerificationModel({
        userId: newUser._id,
        verificationCode: code,
        expiresAt,
    }).save();
    // إرسال الإيميل بعد التأكد من حفظ كل البيانات
    await (0, sendEmails_1.sendEmail)(email, "Verify Your Email", `Hello ${name},

We received a request to verify your Smart College account.
Your verification code is: ${code}
(This code is valid for 2 hours only)

Best regards,
Smart College Team`);
    (0, response_1.SuccessResponse)(res, { message: "Signup successful, check your email for code", userId: newUser._id }, 201);
};
exports.signup = signup;
const verifyEmail = async (req, res) => {
    const { userId, code } = req.body;
    if (!userId || !code) {
        return res.status(400).json({ success: false, error: { code: 400, message: "userId and code are required" } });
    }
    const record = await emailVerifications_1.EmailVerificationModel.findOne({ userId });
    if (!record) {
        return res.status(400).json({ success: false, error: { code: 400, message: "No verification record found" } });
    }
    if (record.verificationCode !== code) {
        return res.status(400).json({ success: false, error: { code: 400, message: "Invalid verification code" } });
    }
    if (record.expiresAt < new Date()) {
        return res.status(400).json({ success: false, error: { code: 400, message: "Verification code expired" } });
    }
    // تحديث المستخدم مباشرة بدون save()
    const user = await User_1.UserModel.findByIdAndUpdate(userId, { isVerified: true }, { new: true } // يرجع النسخة المحدثة
    );
    // حذف سجل التحقق
    await emailVerifications_1.EmailVerificationModel.deleteOne({ userId });
    res.json({ success: true, message: "Email verified successfully" });
};
exports.verifyEmail = verifyEmail;
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
    const token = (0, auth_1.generateToken)({
        id: user._id.toString(),
        name: user.name,
        role: user.role, // 👈 ضيفها لو محتاجها
    });
    (0, response_1.SuccessResponse)(res, { message: "Login Successful", token }, 200);
};
exports.login = login;
const getFcmToken = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = new mongoose_1.Types.ObjectId(req.user.id);
    const user = await User_1.UserModel.findById(userId);
    if (!user)
        return res.status(404).json({ message: "User not found" });
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
    const { email, code, newPassword } = req.body;
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
    user.password = await bcrypt_1.default.hash(newPassword, 10);
    await user.save();
    await emailVerifications_1.EmailVerificationModel.deleteOne({ userId: user._id });
    (0, response_1.SuccessResponse)(res, { message: "Password reset successful" }, 200);
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
const updateProfileImage = async (req, res) => {
    if (!req.user)
        throw new Errors_1.UnauthorizedError("User not found");
    const { BaseImage64 } = req.body;
    if (!BaseImage64) {
        throw new BadRequest_1.BadRequest("Image not provided");
    }
    const user = await User_1.UserModel.findById(req.user?.id);
    if (!user)
        throw new Errors_1.NotFound("User not found");
    const imageUrl = await (0, handleImages_1.saveBase64Image)(BaseImage64, user._id.toString(), req, "profile_images");
    user.BaseImage64 = imageUrl;
    await user.save();
    (0, response_1.SuccessResponse)(res, { message: "Profile image updated successfully", imageUrl }, 200);
};
exports.updateProfileImage = updateProfileImage;
