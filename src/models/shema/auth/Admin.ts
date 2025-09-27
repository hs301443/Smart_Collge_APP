import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    imagePath: { type: String },
    role:{type:String, enum: ["SuperAdmin", "Admin"]},
    roleId: { type: mongoose.SchemaTypes.ObjectId, ref: "Role", default: null },
     isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    fcmtoken: { type: String, default: null },

  },
  { timestamps: true }
);

export const AdminModel = mongoose.model("Admin", adminSchema);

 const  actionSchema =new Schema({
  name: { type: String, required: true ,enum:["create","update","delete","read"]},
})
export const ActionModel = mongoose.model("action", actionSchema);


const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    actionIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: "action" }], 
    
  },
  { timestamps: true }
);

export const RoleModel = mongoose.model("Role", roleSchema);


