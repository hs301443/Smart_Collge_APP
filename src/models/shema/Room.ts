import mongoose, { Schema } from "mongoose";

const roomSchema = new Schema(
  {
    // نوع الغرفة: شات خاص (واحد لواحد) أو جروب
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },

    name: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    // المشاركين (User أو Admin)
    participants: [
      {
        user: { type: Schema.Types.ObjectId, required: true },
        role: { type: String, enum: ["User", "Admin"], required: true },
      },
    ],

    // اللي أنشأ الغرفة
    createdBy: {
      user: { type: Schema.Types.ObjectId, required: true },
      role: { type: String, enum: ["User", "Admin"], required: true },
    },
         isDeleted: { type: Boolean, default: false },

  },
  {
    timestamps: true,
  }
);

// ✅ Indexes
roomSchema.index({ type: 1 });
roomSchema.index({ "participants.user": 1 });

export const RoomModel = mongoose.model("Room", roomSchema);
