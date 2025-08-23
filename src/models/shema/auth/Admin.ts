import mongoose, { Types } from "mongoose";
import { Schema } from "mongoose";


const adminSchema = new Schema(
  {
    
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    imagePath: { type: String },
    role:{type:String,required:true,default:"admin"}
  },
  { timestamps: true }
);

export const Adminmodel = mongoose.model("Admin", adminSchema);
