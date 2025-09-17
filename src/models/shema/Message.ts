
import mongoose , { Schema, Types } from "mongoose";
const MessageSchema = new Schema(
  {
    senderUser: { type: Types.ObjectId, ref: "User" },
    senderAdmin: { type: Types.ObjectId, ref: "Admin" },
    receiverUser: { type: Types.ObjectId, ref: "User" },
    receiverAdmin: { type: Types.ObjectId, ref: "Admin" },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model("Message", MessageSchema);
