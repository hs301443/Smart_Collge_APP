import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: "Conversation", // أو Room حسب اللي عندك
      required: true,
    },
    sender: {
      id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      role: {
        type: String,
        enum: ["Admin", "User"],
        required: true,
      },
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ✅ Indexes for performance
MessageSchema.index({ room: 1, timestamp: -1 });
MessageSchema.index({ "sender.id": 1 });

export const MessageModel = mongoose.model("Message", MessageSchema);
