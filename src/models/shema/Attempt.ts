import mongoose, { Schema } from "mongoose";

const AnswerSchema = new Schema({
  question: { type: Schema.Types.ObjectId, ref: "Question" },
  answer: Schema.Types.Mixed,
  file: String,
  pointsAwarded: { type: Number, default: 0 },
}, { _id: false });

const AttemptSchema = new Schema({
  exam: { type: Schema.Types.ObjectId, ref: "Exam" },
  student: { type: Schema.Types.ObjectId, ref: "User" },
  answers: [AnswerSchema],
  totalPoints: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  status: { type: String, enum: ["in-progress","submitted","expired"], default: "in-progress" },
  startedAt: { type: Date, default: Date.now },
  endAt: { type: Date },
  submittedAt: { type: Date }
}, { timestamps: true });

export const AttemptModel = mongoose.model("Attempt", AttemptSchema);
