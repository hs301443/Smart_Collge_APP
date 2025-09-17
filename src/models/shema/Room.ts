import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      maxlength: 200,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },

    // أعضاء الغرفة (Users فقط)
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Admins منفصلين
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "Admin",
      },
    ],

    // اللي أنشأ الغرفة (ممكن يكون Admin أو User)
    createdBy: {
      id: { type: Schema.Types.ObjectId, required: true },
      role: { type: String, enum: ["User", "Admin"], required: true },
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Indexes
roomSchema.index({ name: 1 });
roomSchema.index({ isPrivate: 1 });

export const RoomModel = mongoose.model("Room", roomSchema);
