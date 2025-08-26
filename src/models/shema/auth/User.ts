import { model, Schema, Types } from "mongoose";
import mongoose from "mongoose";
 const UserSchema = new Schema(
  {
    
    name: { type: String, },
    email: { type: String, unique: true },
    password: { type: String},
    BaseImage64: { type: String},
    fcmtoken: { type: String },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true },   
    role:{type: String, enum: ["Graduated", "Student"]} 

  },
  { timestamps: true, }
);

export const UserModel = mongoose.model('User', UserSchema);




const GraduatedSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    cv: { type: String },
    employment_status: { type: String,enum:["Employed", "Job Seeker", "Freelancer","Postgraduate Studies"] },
    job_title: { type: String },
    company_location: { type: String },
    company_email: { type: String },
    company_link: { type: String },
    company_phone: { type: String },
    about_company: { type: String },
  },
  { timestamps: true }
);

export const GraduatedModel = mongoose.model('Graduated', GraduatedSchema);
