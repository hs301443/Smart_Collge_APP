import mongoose, { Schema } from "mongoose";

const ExamSchema =new mongoose.Schema({
 title: { type: String, required: true },
  description: {String},
  doctorname: { type: String, required: true },
  level: { type: Number, enum: [1,2,3,4,5], required: true },
  department: { type: String, required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question', required: true }],
  isPublished: { type: Boolean, default: false },
  subject_name:{type: String, required: true},
  startAt: Date,
  endAt: Date,
  durationMinutes: Number
},{timestamps: true});

export const ExamModel = mongoose.model('Exam', ExamSchema);