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
    return res.status(400).json({
      success: false,
      message: "Invalid Google payload",
    });
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

    user = new UserModel({
      googleId,
      email,
      name,
      role,
      isVerified: true,
      isNew: true,
    });

    try {
      await user.save();
    } catch (dbErr: any) {
      console.error("Mongo save error:", dbErr);
      return res.status(500).json({
        success: false,
        message: "Database error while saving user",
        error: dbErr.message,
      });
    }
  } else {
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  }

  const authToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return res.json({
    success: true,
    token: authToken,
    role: user.role,
    isNew: user.isNew,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
  });

} catch (error: any) {
  console.error("Google verify error:", error.message);
  return res.status(401).json({
    success: false,
    message: "Invalid Google token",
    error: error.message,
  });
}
}