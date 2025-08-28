import mongoose, { Schema, Types } from "mongoose";

const adminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    imagePath: { type: String },

    isSuperAdmin: { type: Boolean, default: false },

    role: { type: Types.ObjectId, ref: "Role", default: null },

    customPermissions: [{ type: String }]
  },
  { timestamps: true }
);

export const AdminModel = mongoose.model("Admin", adminSchema);


const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true }, 
    permissions: [{ type: String, required: true }],      
    description: String
  },
  { timestamps: true }
);

export const RoleModel = mongoose.model("Role", roleSchema);
