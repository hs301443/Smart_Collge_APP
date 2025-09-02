import mongoose, { Schema, Types } from "mongoose";

const ConversationSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    admin: { type: Types.ObjectId, ref: "Admin", required: true },
    lastMessageAt: { type: Date, default: Date.now },
    unread: {
     user: { type: Number, required: true, default: 0 },
    admin: { type: Number, required: true, default: 0 },
    },
  },
  { timestamps: true }
);


export const ConversationModel = mongoose.model("Conversation", ConversationSchema);