// controllers/authController.ts
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "../models/shema/auth/User";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (req: Request, res: Response) => {
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

    const email = payload.email!;
    const name = payload.name || "Unknown User";
    const googleId = payload.sub;

    let user = await UserModel.findOne({ googleId });

    if (!user) {
      const existingByEmail = await UserModel.findOne({ email });

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
      } else {
        // إنشاء يوزر جديد
        user = new UserModel({
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
    const authToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

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

  } catch (error) {
    console.error("Google login error:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

