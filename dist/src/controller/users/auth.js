"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeProfile = exports.resetPassword = exports.verifyResetCode = exports.sendResetCode = exports.getFcmToken = exports.login = exports.verifyEmail = exports.signup = void 0;
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
    const { name, phoneNumber, email, password, dateOfBirth, type, imageBase64, graduatedData, } = req.body;
    // ✅ تحقق من وجود مستخدم مسبقًا
    const existing = await User_1.UserModel.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existing) {
        if (existing.email === email) {
            throw new Errors_1.UniqueConstrainError("Email", "User already signed up with this email");
        }
        if (existing.phoneNumber === phoneNumber) {
            throw new Errors_1.UniqueConstrainError("Phone Number", "User already signed up with this phone number");
        }
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const newUser = new User_1.UserModel({
        name,
        phoneNumber,
        email,
        password: hashedPassword,
        type,
        imageBase64,
        dateOfBirth,
        isVerified: false,
    });
    await newUser.save();
    if (type === "Graduated") {
        await User_1.GraduatedModel.create({
            user: newUser._id,
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
    await (0, sendEmails_1.sendEmail)(email, "Verify Your Email", `Your code is ${code}`);
    (0, response_1.SuccessResponse)(res, { message: "Signup successful, check your email for code", userId: newUser._id }, 201);
};
exports.signup = signup;
const verifyEmail = async (req, res) => {
    const { userId, code } = req.body;
    if (!userId || !code) {
        return res.status(400).json({ success: false, error: { code: 400, message: "userId and code are required" } });
    }
    const user = await User_1.UserModel.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, error: { code: 404, message: "User not found" } });
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
    user.isVerified = true;
    await user.save();
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
        id: user._id,
        name: user.name,
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
        return res.status(404).json({ message: "User not found" });
    if (!user.isVerified)
        return res.status(400).json({ message: "User is not verified or approved" });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // حذف أي كود موجود مسبقًا
    await emailVerifications_1.EmailVerificationModel.deleteMany({ email });
    // إضافة الكود الجديد
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // ساعتين
    await emailVerifications_1.EmailVerificationModel.create({
        email,
        verificationCode: code,
        expiresAt,
    });
    await (0, sendEmails_1.sendEmail)(email, "Password Reset Code", `Your reset code is: ${code}\nIt will expire in 2 hours.`);
    (0, response_1.SuccessResponse)(res, { message: "Reset code sent to your email" }, 200);
};
exports.sendResetCode = sendResetCode;
const verifyResetCode = async (req, res) => {
    const { email, code } = req.body;
    const record = await emailVerifications_1.EmailVerificationModel.findOne({ email });
    if (!record)
        throw new BadRequest_1.BadRequest("No reset code found");
    if (record.verificationCode !== code)
        throw new BadRequest_1.BadRequest("Invalid code");
    if (record.expiresAt < new Date())
        throw new BadRequest_1.BadRequest("Code expired");
    (0, response_1.SuccessResponse)(res, { message: "Reset code verified successfully" }, 200);
};
exports.verifyResetCode = verifyResetCode;
const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    const record = await emailVerifications_1.EmailVerificationModel.findOne({ email });
    if (!record)
        throw new BadRequest_1.BadRequest("No reset code found");
    if (record.verificationCode !== code)
        throw new BadRequest_1.BadRequest("Invalid code");
    if (record.expiresAt < new Date())
        throw new BadRequest_1.BadRequest("Code expired");
    const user = await User_1.UserModel.findOne({ email });
    if (!user)
        throw new Errors_1.NotFound("User not found");
    user.password = await bcrypt_1.default.hash(newPassword, 10);
    await user.save();
    await emailVerifications_1.EmailVerificationModel.deleteOne({ email });
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
