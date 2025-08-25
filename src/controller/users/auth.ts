import { Request, Response } from "express";
import { saveBase64Image } from "../../utils/handleImages";
import { EmailVerificationModel} from "../../models/shema/auth/emailVerifications";
import { GraduatedModel, UserModel } from "../../models/shema/auth/User";
import bcrypt from "bcrypt";
import { SuccessResponse } from "../../utils/response";
import { randomInt } from "crypto";
import {
  ForbiddenError,
  NotFound,
  UnauthorizedError,
  UniqueConstrainError,
} from "../../Errors";
import { generateToken } from "../../utils/auth";
import { sendEmail } from "../../utils/sendEmails";
import { BadRequest } from "../../Errors/BadRequest";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../../types/custom";

export const signup = async (req: Request, res: Response) => {
  const {
    name,
    phoneNumber,
    email,
    password,
    dateOfBirth,
    role,           
    imageBase64,
    graduatedData, 
  } = req.body;

  // ✅ تحقق من وجود مستخدم مسبقًا
  const existing = await UserModel.findOne({ $or: [{ email }, { phoneNumber }] });
  if (existing) {
    if (existing.email === email) {
      throw new UniqueConstrainError("Email", "User already signed up with this email");
    }
    if (existing.phoneNumber === phoneNumber) {
      throw new UniqueConstrainError("Phone Number", "User already signed up with this phone number");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new UserModel({
    name,
    phoneNumber,
    email,
    password: hashedPassword,
    role,          
    imageBase64,
    dateOfBirth,
    isVerified: false,
  });

  await newUser.save();

  if (role === "Graduated") {
    await GraduatedModel.create({
      user: newUser._id,
      ...graduatedData,
    });
  }

  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);   

  await new EmailVerificationModel({
    userId: newUser._id,
    verificationCode: code,
    expiresAt,
  }).save();

await sendEmail(
  email,
  "Verify Your Email",
  `
Hello ${name},

We received a request to verify your Smart College account.
Your verification code is: ${code}
(This code is valid for 2 hours only)

Best regards,  
Smart College Team
`
);

  SuccessResponse(
    res,
    { message: "Signup successful, check your email for code", userId: newUser._id },
    201
  );
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ success: false, error: { code: 400, message: "userId and code are required" } });
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 404, message: "User not found" } });
  }

  const record = await EmailVerificationModel.findOne({ userId });
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

  await EmailVerificationModel.deleteOne({ userId });

  res.json({ success: true, message: "Email verified successfully" });
};


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!password) {
    throw new UnauthorizedError("Password is required");
  }

  const user = await UserModel.findOne({ email });
  if (!user || !user.password) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  
  if (!user.isVerified) {
    throw new ForbiddenError("Verify your email first");
  }

  const token = generateToken({
    id: user._id,
    name: user.name,
  });

  SuccessResponse(res, { message: "Login Successful", token }, 200);
};


export const getFcmToken = async (req: AuthenticatedRequest, res: Response) => {

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId: Types.ObjectId = new Types.ObjectId(req.user.id);

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.fcmtoken = req.body.token;
  await user.save();

  SuccessResponse(res, { message: "FCM token updated successfully" }, 200);
};




export const sendResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (!user.isVerified )
    return res.status(400).json({ message: "User is not verified or approved" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // حذف أي كود موجود مسبقًا
  await EmailVerificationModel.deleteMany({ email });

  // إضافة الكود الجديد
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // ساعتين
  await EmailVerificationModel.create({
    email,
    verificationCode: code,
    expiresAt,
  });

  await sendEmail(
  email,
  "Verify Your Email",
  `
Hello ${user.name},

We received a request to reset the password for your Smart College account.

Your verification code is: ${code}
(This code is valid for 2 hours only)

Best regards,  
Smart College Team
`
);

  SuccessResponse(res, { message: "Reset code sent to your email" }, 200);
}
export const verifyResetCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  const record = await EmailVerificationModel.findOne({ email });
  if (!record) throw new BadRequest("No reset code found");
  if (record.verificationCode !== code) throw new BadRequest("Invalid code");
  if (record.expiresAt < new Date()) throw new BadRequest("Code expired");
  
  SuccessResponse(res, { message: "Reset code verified successfully" }, 200);
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  const record = await EmailVerificationModel.findOne({ email });
  if (!record) throw new BadRequest("No reset code found");
  if (record.verificationCode !== code) throw new BadRequest("Invalid code");
  if (record.expiresAt < new Date()) throw new BadRequest("Code expired");

  const user = await UserModel.findOne({ email });
  if (!user) throw new NotFound("User not found");

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await EmailVerificationModel.deleteOne({ email });

 SuccessResponse(res, { message: "Password reset successful" }, 200);
};



export const completeProfile = async (req: Request, res: Response) => {

  const { userId,role, graduatedData } = req.body; 

  if (!role || !["Student", "Graduated"].includes(role)) {
    return res.status(400).json({ message: "Invalid role provided" });
  }

  const user = await UserModel.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = role;
  await user.save();

  if (role === "Graduated" && graduatedData) {
    let graduated = await GraduatedModel.findOne({ user: user._id });
    if (!graduated) {
      graduated = await GraduatedModel.create({
        user: user._id,
        ...graduatedData,
      });
    } else {
      Object.assign(graduated, graduatedData);
      await graduated.save();
    }
  }

  const { password, ...userData } = user.toObject();

  SuccessResponse(res,"complete profile successfuly")
};

