import { Request, Response } from "express";
import { LectureModel } from "../../models/shema/lecture";
import { saveBase64Image, uploadFileToCloudinary } from "../../utils/handleImages";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

export const createLecture = async (req: Request, res: Response) => {
  const { sub_name, level, department, num_of_week, title, iconBase64 } = req.body;

  if (!sub_name || !title || !num_of_week) {
    throw new BadRequest("Required fields are missing");
  }

  let iconUrl = "";
  if (iconBase64) {
    // ✅ رفع الأيقونة إلى Cloudinary
    iconUrl = await saveBase64Image(iconBase64, "lectures/icons", Date.now().toString());
  }

  const lecture = new LectureModel({
    sub_name,
    level,
    department,
    num_of_week,
    title,
    icon: iconUrl,
  });

  await lecture.save();
  return SuccessResponse(res, lecture, 201);
};

// ----------------------------------------------------------

export const uploadLecturePDF = async (req: Request, res: Response) => {
  const lecture = await LectureModel.findById(req.params.id);
  if (!lecture) throw new NotFound("Lecture not found");

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) throw new BadRequest("No PDFs uploaded");

  // ✅ رفع كل ملف PDF إلى Cloudinary
  for (const file of files) {
    const result = await uploadFileToCloudinary(file.path, "lectures/pdfs");
    lecture.pdfs.push({
      name: file.originalname,
      url: result.secure_url,
    });
  }

  await lecture.save();
  return SuccessResponse(res, lecture);
};

// ----------------------------------------------------------

export const uploadLectureVideo = async (req: Request, res: Response) => {
  const lecture = await LectureModel.findById(req.params.id);
  if (!lecture) throw new NotFound("Lecture not found");

  if (!req.file) throw new BadRequest("No video file uploaded");

  // ✅ رفع الفيديو إلى Cloudinary
  const result = await uploadFileToCloudinary(req.file.path, "lectures/videos", "video");

  lecture.video = {
    name: req.file.originalname,
    url: result.secure_url,
    duration: 0,
    quality: "720p",
    uploadDate: new Date(),
  };

  await lecture.save();
  return SuccessResponse(res, lecture);
};

// ----------------------------------------------------------

export const getLectures = async (req: Request, res: Response) => {
  const lectures = await LectureModel.find();
  return SuccessResponse(res, lectures);
};

// ----------------------------------------------------------

export const getLectureById = async (req: Request, res: Response) => {
  const lecture = await LectureModel.findById(req.params.id);
  if (!lecture) throw new NotFound("Lecture not found");
  return SuccessResponse(res, lecture);
};

// ----------------------------------------------------------

export const updateLecture = async (req: Request, res: Response) => {
  const lecture = await LectureModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!lecture) throw new NotFound("Lecture not found");
  return SuccessResponse(res, lecture);
};

// ----------------------------------------------------------

export const deleteLecture = async (req: Request, res: Response) => {
  const lecture = await LectureModel.findByIdAndDelete(req.params.id);
  if (!lecture) throw new NotFound("Lecture not found");
  return SuccessResponse(res, { message: "Lecture deleted" });
};
