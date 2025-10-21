import mongoose from "mongoose";

const levelSchema =new mongoose.Schema({
    level_number: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
})
export const LevelModel = mongoose.model("level", levelSchema);