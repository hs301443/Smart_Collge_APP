import { Schema, Types } from "mongoose";
import mongoose from "mongoose";
 const UserSchema = new Schema(
  {
    
    name: { type: String, },
    phoneNumber: { type: String },
    email: { type: String, unique: true },
    role:{ type: String, enum: ["member", "guest"], default: "member" },
    password: { type: String},
    dateOfBirth: { type: Date,},
    fcmtoken: { type: String },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true }, // 👈 هنا كمان

  },
  { timestamps: true, }
);


export const UserModel = mongoose.model('User', UserSchema);