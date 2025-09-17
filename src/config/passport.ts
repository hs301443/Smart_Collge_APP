// controllers/authController.ts
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "../models/shema/auth/User";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  const role = req.body.role;

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

    let user = await UserModel.findOne({ googleId }) || await UserModel.findOne({ email });

    if (!user) {
      if (!role) {
        return res.status(400).json({
          success: false,
          message: "Role is required for new users.",
        });
      }

      // 🆕 Sign Up → isNew = true
      user = new UserModel({
        googleId,
        email,
        name,
        role,
        isVerified: true,
        isNew:true, // ✅ ده المهم
      });
      await user.save();
    } else {
      // Login → ما نلمسش الـ role ولا isNew
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    }

    // JWT
    const authToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token: authToken,
      role: user.role,
      isNew: user.isNew, // ✅ رجّعها للفرونت عشان يعرف
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
