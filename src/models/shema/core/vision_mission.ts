import mongoose from "mongoose";


const VisionMissionSchema = new mongoose.Schema({
  title: String,
  description: String,
  image:String

},{
    timestamps: true
}
);

export const VisionMissionModel = mongoose.model("VisionMission", VisionMissionSchema);