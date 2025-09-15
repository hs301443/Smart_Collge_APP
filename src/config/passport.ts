// controllers/authController.ts
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "../models/shema/auth/User";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (req: Request, res: Response) => {
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

    const email = payload.email!;
    const name = payload.name || "Unknown User";
    const googleId = payload.sub;

    // البحث أولاً بالـ googleId
    let user = await UserModel.findOne({ googleId });

    if (!user) {
      // لو مفيش googleId، شوف لو فيه email موجود
      const existingByEmail = await UserModel.findOne({ email });

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
      } else {
        // إنشاء مستخدم جديد
        user = new UserModel({
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
    const authToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    return res.json({ token: authToken });

  } catch (error) {
    console.error("Google login error:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
