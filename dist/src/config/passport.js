"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/shema/auth/User");
dotenv_1.default.config();
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const verifyGoogleToken = async (req, res) => {
    const { token, role } = req.body; // لازم client يبعت الدور: "Student" أو "Graduated"
    if (!role) {
        return res.status(400).json({ success: false, message: "Role is required" });
    }
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ success: false, message: "Invalid Google payload" });
        }
        const email = payload.email;
        const name = payload.name || "Unknown User";
        const googleId = payload.sub;
        // البحث أولاً بالـ googleId
        let user = await User_1.UserModel.findOne({ googleId });
        if (!user) {
            // لو مفيش googleId، شوف لو فيه email موجود
            const existingByEmail = await User_1.UserModel.findOne({ email });
            if (existingByEmail) {
                // لو الدور مختلف، ارفض الربط
                if (existingByEmail.role !== role) {
                    return res.status(400).json({
                        success: false,
                        message: `This email is already registered as a different role: ${existingByEmail.role}`
                    });
                }
                // نفس الدور → حدث googleId
                existingByEmail.googleId = googleId;
                await existingByEmail.save();
                user = existingByEmail;
            }
            else {
                // إنشاء مستخدم جديد
                user = new User_1.UserModel({
                    googleId,
                    email,
                    name,
                    role,
                    isVerified: true,
                });
                await user.save();
            }
        }
        // توليد JWT
        const authToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.json({ token: authToken });
    }
    catch (error) {
        console.error("Google login error:", error);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};
exports.verifyGoogleToken = verifyGoogleToken;
