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
    const { token, role } = req.body;
    // لازم الـ frontend يبعت role: "Student" أو "Graduated"
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
        let user = await User_1.UserModel.findOne({ googleId });
        if (!user) {
            const existingByEmail = await User_1.UserModel.findOne({ email });
            if (existingByEmail) {
                // لو اليوزر موجود بنفس الايميل
                if (existingByEmail.role !== role) {
                    // لو فيه اختلاف بين الدور اللي في DB واللي جاي من الـ frontend → امنع
                    return res.status(400).json({
                        success: false,
                        message: "Role mismatch. Please login with correct role.",
                    });
                }
                existingByEmail.googleId = googleId;
                await existingByEmail.save();
                user = existingByEmail;
            }
            else {
                // إنشاء يوزر جديد
                user = new User_1.UserModel({
                    googleId,
                    email,
                    name,
                    role, // هنا مهم
                    isVerified: true,
                });
                await user.save();
            }
        }
        // توليد JWT
        const authToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.json({
            success: true,
            token: authToken,
            role: user.role,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        });
    }
    catch (error) {
        console.error("Google login error:", error);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};
exports.verifyGoogleToken = verifyGoogleToken;
