// models/Question.ts
import mongoose, { Schema } from 'mongoose';

const ChoiceSchema = new Schema({
  text: String
}, { _id: true });

const QuestionSchema = new Schema({
  exam: { type: Schema.Types.ObjectId, ref: 'Exam' },
  type: { 
    type: String, 
    enum: ['single-choice','multiple-choice','true-false','file-upload'] 
  },
  text: String,
  choices: [ChoiceSchema],       // للـ MCQ بس
  correctAnswer: Schema.Types.Mixed, // للـ MCQ بس
  points: { type: Number, default: 1 },
  image: String
}, { timestamps: true });


export const QuestionModel = mongoose.model('Question', QuestionSchema);
