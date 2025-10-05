import mongoose, { Schema, Document, Types } from "mongoose";

interface Choice {
  text: string;
}

export interface Question extends Document {
  exam: Types.ObjectId;
  text: string;
  type: "MCQ" | "short-answer" | "file-upload";
  choices?: Choice[];
  correctAnswer?: any;
  points: number;
  image?: string;
}

const ChoiceSchema = new Schema({
  text: String
}, { _id: true });

const QuestionSchema = new Schema<Question>({
  exam: { type: Schema.Types.ObjectId, ref: "Exam" },
  text: { type: String, required: true },
  type: { type: String, enum: ["MCQ", "short-answer", "file-upload"], required: true },
  choices: [ChoiceSchema],
  correctAnswer: Schema.Types.Mixed,
  points: { type: Number, default: 1 },
  image: String
}, { timestamps: true });

export const QuestionModel = mongoose.model<Question>("Question", QuestionSchema);

// ==========================================================

export interface Exam extends Document {
  title: string;
  subject_name: string;
  level: number;
  department: string;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  questions: Types.ObjectId[]; // هنا نخليها واضحة لـ TypeScript
  isPublished: boolean;
}

const ExamSchema = new Schema<Exam>({
  title: { type: String, required: true },
  subject_name: { type: String, required: true },
  level: { type: Number, required: true },
  department: { type: String, required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export const ExamModel = mongoose.model<Exam>("Exam", ExamSchema);
