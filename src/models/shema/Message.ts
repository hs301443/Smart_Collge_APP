import mongoose, { Schema,  } from "mongoose";

const MessageSchema = new Schema(
  {
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    sender: {
      user: { type: Schema.Types.ObjectId, required: true },
      role: { type: String, enum: ["User", "Admin"], required: true },
    },
    content: { type: String, trim: true },
    attachment: {
      type: { type: String, enum: ["image", "file", "audio"], default: null },
      url: { type: String, default: null },
    },
    deliveredTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    timestamp: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }, // ✅ إضافة هنا
  },
  { timestamps: true }
);


export const MessageModel = mongoose.model("Message", MessageSchema);
