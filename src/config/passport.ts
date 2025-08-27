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

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Google payload" });
    }

    const email = payload.email!;
    const name = payload.name || "Unknown User";
    const googleId = payload.sub;

    // 🔍 check if user exists in MongoDB
    let user = await UserModel.findOne({ googleId });

    // ➕ create if not exists
    if (!user) {
      user = new UserModel({
        googleId,
        email,
        name,
        isVerified: true,
      });
      await user.save();
    }

    // 🔑 Generate JWT
    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
