import mongoose, { Schema } from "mongoose";

const NewsSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    mainImage: { type: String, required: true },
    images: [{ type: String }],    
    optional: [{ type: String }],    
    event_link: { type: String }, 
    event_date: { type: Date },   
    type: { type: String, enum: ["news", "event","announcement"], required: true },  
  },
  { timestamps: true } 
);

export const NewsModel = mongoose.model("News", NewsSchema);
