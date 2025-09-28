"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lecture_1 = require("../../controller/admin/lecture");
const multer_1 = require("../../utils/multer");
const catchAsync_1 = require("../../utils/catchAsync");
const router = express_1.default.Router();
// Create lecture (with icon Base64)
router.post("/", (0, catchAsync_1.catchAsync)(lecture_1.createLecture));
// Upload PDF
router.post("/:id/pdf", multer_1.uploadPDF.array("pdfs", 10) // تقدر تحدد الحد الأقصى للملفات
, (0, catchAsync_1.catchAsync)(lecture_1.uploadLecturePDF));
// Upload Video
router.post("/:id/video", multer_1.uploadVideo.single("video"), (0, catchAsync_1.catchAsync)(lecture_1.uploadLectureVideo));
// Get all
router.get("/", (0, catchAsync_1.catchAsync)(lecture_1.getLectures));
// Get one
router.get("/:id", (0, catchAsync_1.catchAsync)(lecture_1.getLectureById));
// Update
router.put("/:id", (0, catchAsync_1.catchAsync)(lecture_1.updateLecture));
// Delete
router.delete("/:id", (0, catchAsync_1.catchAsync)(lecture_1.deleteLecture));
exports.default = router;
