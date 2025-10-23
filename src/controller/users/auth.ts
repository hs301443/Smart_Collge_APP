import { Request, Response } from "express";
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
import mongoose, { ObjectId } from "mongoose";
import { AuthenticatedRequest } from "../../types/custom";
import{saveBase64Image}from"../../utils/handleImages"


// login.ts
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

  // ابعت user كامل مش object معمول له تعديل
  const token = generateToken(user, "user");

  SuccessResponse(
    res,
    {
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        department: user.department,
      },
    },
    200
  );
};


export const getFcmToken = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError("User not found");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFound("User not found");
  }
  user.fcmtoken = req.body.token;
  await user.save();

  SuccessResponse(res, { message: "FCM token updated successfully" }, 200);
};



export const sendResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) throw new NotFound("User not found");
  if (!user.isVerified) throw new BadRequest("User is not verified");

  const code = randomInt(100000, 999999).toString();

  // حذف أي كود موجود مسبقًا
  await EmailVerificationModel.deleteMany({ userId: user._id });

  // إنشاء كود جديد
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // ساعتين
  await EmailVerificationModel.create({
    userId: user._id,
    verificationCode: code,
    expiresAt,
  });

  await sendEmail(
    email,
    "Reset Password Code",
    `Hello ${user.name},

Your password reset code is: ${code}
(This code is valid for 2 hours)

Best regards,
Smart College Team`
  );

  SuccessResponse(res, { message: "Reset code sent to your email" }, 200);
};

// 2️⃣ التحقق من الكود
export const verifyResetCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  // ✅ 1. دور على اليوزر
  const user = await UserModel.findOne({ email });
  if (!user) throw new NotFound("User not found");

  const userId = user._id;
  // ✅ 2. دور على الكود باستخدام user._id
  const record = await EmailVerificationModel.findOne({ userId});
  if (!record) throw new BadRequest("No reset code found");

  // ✅ 3. تحقق من الكود
  if (record.verificationCode !== code) throw new BadRequest("Invalid code");

  // ✅ 4. تحقق من الصلاحية
  if (record.expiresAt < new Date()) throw new BadRequest("Code expired");


  // ✅ 5. رجّع رد النجاح
  SuccessResponse(res, { message: "Reset code verified successfully" }, 200);
};

// 3️⃣ إعادة تعيين كلمة المرور
export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) throw new NotFound("User not found");

  const record = await EmailVerificationModel.findOne({ userId: user._id });
  if (!record) throw new BadRequest("No reset code found");

  // تحديث الباسورد
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  // حذف سجل التحقق
  await EmailVerificationModel.deleteOne({ userId: user._id });
const token = generateToken(user, "user");

  SuccessResponse(
    res,
    {
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        department: user.department,
      },
    },
    200
  );};

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





export const completeProfileStudent = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("User not found");

  const { department, level } = req.body;
  if (!department) throw new BadRequest("department not provided");
  if (!level) throw new BadRequest("level not provided");

  const user = await UserModel.findById(req.user.id);
  if (!user) throw new NotFound("User not found");

  if (user.role !== "Student") {
    throw new BadRequest("Only students can complete student profile");
  }

  // 🛑 تحقق إذا كان البروفايل مكتمل بالفعل
  if (!user.isNew) {
    throw new BadRequest("Profile already completed");
  }

  user.department = department;
  user.level = level;
  user.isNew = false;
  await user.save();

  return SuccessResponse(res, {
    message: "Profile completed successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      level: user.level,
      department: user.department
    }
  });
};


// ✅ Get profile
export const getProfile = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const user = await UserModel.findById(req.user.id).select("-password");
  if (!user) throw new NotFound("User not found");

  // لو المستخدم خريج → هات بياناته من GraduatedModel كمان
  let graduated = null;
  if (user.role === "Graduated") {
    graduated = await GraduatedModel.findOne({ user: user._id });
  }

  SuccessResponse(res, { user, graduated }, 200);
};

// ✅ Delete profile
export const deleteProfile = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const user = await UserModel.findById(req.user.id);
  if (!user) throw new NotFound("User not found");

  // لو خريج → احذف بيانات الخريج كمان
  if (user.role === "Graduated") {
    await GraduatedModel.findOneAndDelete({ user: user._id });
  }

  await user.deleteOne();

  SuccessResponse(res, { message: "User deleted successfully" }, 200);
};


// ✅ Signup
export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role, BaseImage64, graduatedData, level, department } = req.body;

  const existing = await UserModel.findOne({ email });
  if (existing) throw new UniqueConstrainError("Email", "User already signed up with this email");

  const hashedPassword = await bcrypt.hash(password, 10);

  let imageUrl = "";
  if (BaseImage64) {
    imageUrl = await saveBase64Image(BaseImage64, "users", new mongoose.Types.ObjectId().toString());
  }

  const userData: any = {
    name,
    email,
    password: hashedPassword,
    role,
    BaseImage64: imageUrl || null,
    isVerified: false,
    isNew: false,
  };

  if (role === "Student") {
    userData.level = level;
    userData.department = department;
  }

  const newUser = new UserModel(userData);
  await newUser.save();

  if (role === "Graduated" && graduatedData) {
    await GraduatedModel.create({
      user: newUser._id,
      name: newUser.name,
      email: newUser.email,
      BaseImage64: newUser.BaseImage64,
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
    `Hello ${name},
Your verification code is: ${code}
(This code is valid for 2 hours only)`
  );

  SuccessResponse(res, { message: "Signup successful, check your email for code", userId: newUser._id }, 201);
};

// ✅ Verify Email
export const verifyEmail = async (req: Request, res: Response) => {
  const { userId, code } = req.body;

  if (!userId || !code) throw new BadRequest("userId and code are required");

  const record = await EmailVerificationModel.findOne({ userId });
  if (!record) throw new BadRequest("No verification record found");
  if (record.verificationCode !== code) throw new BadRequest("Invalid verification code");
  if (record.expiresAt < new Date()) throw new BadRequest("Verification code expired");

  const user = await UserModel.findByIdAndUpdate(userId, { isVerified: true }, { new: true });
  if (!user) throw new NotFound("User not found");

  await EmailVerificationModel.deleteOne({ userId });

  const token = generateToken(user, "user");

  return SuccessResponse(res, { message: "Email verified successfully", token, user }, 200);
};

// ✅ Update profile image
export const updateProfileImage = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError("User not found");

  const { BaseImage64 } = req.body;
  if (!BaseImage64) throw new BadRequest("Image not provided");

  const user = await UserModel.findById(req.user.id);
  if (!user) throw new NotFound("User not found");

  const imageUrl = await saveBase64Image(BaseImage64, "profile_images", user._id.toString());
  user.BaseImage64 = imageUrl;
  await user.save();

  SuccessResponse(res, { message: "Profile image updated successfully", imageUrl }, 200);
};

// ✅ Update profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Unauthorized");

  const { name, BaseImage64, department, level, graduatedData } = req.body;

  const user = await UserModel.findById(req.user.id);
  if (!user) throw new NotFound("User not found");

  if (BaseImage64) {
    const imageUrl = await saveBase64Image(BaseImage64, "users", user._id.toString());
    user.BaseImage64 = imageUrl;
  }

  if (name) user.name = name;
  if (department) user.department = department;
  if (level) user.level = level;

  if (user.role === "Graduated" && graduatedData) {
    const graduated = await GraduatedModel.findOne({ user: user._id });
    if (!graduated) {
      await GraduatedModel.create({ user: user._id, ...graduatedData });
    } else {
      Object.assign(graduated, graduatedData);
      await graduated.save();
    }
  }

  await user.save();
  SuccessResponse(res, { message: "Profile updated successfully", user }, 200);
};
