// models/Attempt.ts
import mongoose, { Schema } from 'mongoose';

const AnswerSchema = new Schema({
  question: { type: Schema.Types.ObjectId, ref: 'Question' },
  answer: Schema.Types.Mixed,
  file: String,                     
  pointsAwarded: Number
}, { _id: false });

const AttemptSchema = new Schema({
  exam: { type: Schema.Types.ObjectId, ref: 'Exam' },
student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [AnswerSchema],
  totalPoints: Number,
  status: { type: String, enum: ['in-progress','submitted','graded'], default: 'in-progress' },
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date
}, { timestamps: true });

export const AttemptModel = mongoose.model('Attempt', AttemptSchema);
