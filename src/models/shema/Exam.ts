import mongoose, { Schema } from "mongoose";

const ChoiceSchema = new Schema({
  text: String
}, { _id: true });

const QuestionSchema = new Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ["MCQ", "short-answer", "file-upload"], required: true },
  choices: [ChoiceSchema],
  correctAnswer: Schema.Types.Mixed,
  points: { type: Number, default: 1 },
  image: String
}, { timestamps: true });

const ExamSchema = new Schema({
  title: { type: String, required: true },
  subject_name: { type: String, required: true },
  level: { type: Number, required: true },
  department: { type: String, required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  questions: [QuestionSchema],
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export const ExamModel = mongoose.model("Exam", ExamSchema);
