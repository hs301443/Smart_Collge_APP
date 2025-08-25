import mongoose from 'mongoose';
import { UserModel } from './User';
const EmailVerificationSchema = new mongoose.Schema(
  {
    verificationCode: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);  

export const EmailVerificationModel = mongoose.model('EmailVerification', EmailVerificationSchema)