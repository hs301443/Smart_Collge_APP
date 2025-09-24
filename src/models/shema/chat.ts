import mongoose, { Schema } from "mongoose";

const ChatSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    admin: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  { timestamps: true }
);

// ensure unique chat per user-admin
ChatSchema.index({ user: 1, admin: 1 }, { unique: true });

export const ChatModel = mongoose.model("Chat", ChatSchema);