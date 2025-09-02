import mongoose, { Schema, Types } from "mongoose";

const MessageSchema = new Schema(
  {
    conversation: { type: Types.ObjectId, ref: "Conversation", required: true },
    from: { type: Types.ObjectId, required: true },
    fromModel: { type: String, enum: ["Admin", "User"], required: true },
    to: { type: Types.ObjectId, required: true },
    toModel: { type: String, enum: ["Admin", "User"], required: true },
    text: { type: String },
    attachments: [{ url: String, name: String }],
    createdAt: { type: Date, default: Date.now },
    seenAt: { type: Date },
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model("Message", MessageSchema);