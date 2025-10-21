"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LevelModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const levelSchema = new mongoose_1.default.Schema({
    level_number: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
});
exports.LevelModel = mongoose_1.default.model("level", levelSchema);
