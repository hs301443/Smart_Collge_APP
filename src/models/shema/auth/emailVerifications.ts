import mongoose from 'mongoose';
import { UserModel } from './User';
const EmailVerificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    verificationCode: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);  

export const EmailVerificationModel = mongoose.model('EmailVerification', EmailVerificationSchema)