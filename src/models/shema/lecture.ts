import mongoose,{Schema} from "mongoose";

const LectureSchema = new Schema({
   sub_name: {
    type: String,
    required: true,
    trim: true
  },
  
   level:{type:Number, enum:[1,2,3,4,5],},
    department: { type: String,enum:["IT","CS","IS","AI"],},
  icon: {
    type: String,
  },
  
  num_of_week: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  pdfs: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  video: {
    name: {
      type: String,
      default: null
    },
    url: {
      type: String,
      default: null
    },
    duration: {
      type: Number, // مدة الفيديو بالثواني
      default: 0
    },
    quality: {
      type: String,
      enum: ['360p', '480p', '720p', '1080p', '4K'],
      default: '720p'
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true // يضيف createdAt و updatedAt تلقائياً
});


export const LectureModel = mongoose.model('Lecture', LectureSchema);