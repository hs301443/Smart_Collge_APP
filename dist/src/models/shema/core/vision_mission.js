"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisionMissionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const VisionMissionSchema = new mongoose_1.default.Schema({
    title: String,
    description: String,
    image: String
}, {
    timestamps: true
});
exports.VisionMissionModel = mongoose_1.default.model("VisionMission", VisionMissionSchema);
