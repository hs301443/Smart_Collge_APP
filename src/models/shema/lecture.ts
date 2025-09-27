import mongoose,{Schema} from "mongoose";

const LectureSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
})

export const LectureModel = mongoose.model('Lecture', LectureSchema);