import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderModel: { type: String, enum: ["User", "Admin"], required: true },
    sender: { type: Schema.Types.ObjectId, required: true, refPath: "senderModel" },
    content: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, refPath: "senderModel" }],
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model("Message", MessageSchema);