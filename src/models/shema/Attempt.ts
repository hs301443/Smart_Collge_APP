import mongoose, { Schema } from "mongoose";

// هنا هنخزن نسخة السؤال نفسه بدل ref لـ Question
const QuestionSchema = new Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ["MCQ", "short-answer", "file-upload"], required: true },
  choices: [{ text: String }],
  correctAnswer: Schema.Types.Mixed,
  points: { type: Number, default: 1 },
  image: String
}, { _id: false });

const AnswerSchema = new Schema({
  question: QuestionSchema, // بدل ObjectId + ref
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
