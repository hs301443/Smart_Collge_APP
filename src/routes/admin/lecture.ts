import express from "express";
import {
  createLecture,
  uploadLecturePDF,
  uploadLectureVideo,
  getLectures,
  getLectureById,
  updateLecture,
  deleteLecture
} from "../../controller/admin/lecture";
import { uploadVideo, uploadPDF } from "../../utils/multer";
import { catchAsync } from "../../utils/catchAsync";

const router = express.Router();

// Create lecture (with icon Base64)
router.post("/", catchAsync(createLecture));
// Upload PDF
router.post("/:id/pdf", uploadPDF.single("pdf"), catchAsync(uploadLecturePDF));
// Upload Video
router.post("/:id/video", uploadVideo.single("video"), catchAsync(uploadLectureVideo));

// Get all
router.get("/", catchAsync(getLectures));

// Get one
router.get("/:id", catchAsync(getLectureById));

// Update
router.put("/:id", catchAsync(updateLecture));

// Delete
router.delete("/:id", catchAsync(deleteLecture));

export default router;
