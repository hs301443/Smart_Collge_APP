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
  if (iconBase64 && iconBase64.startsWith("data:image")) {
    iconUrl = await saveBase64Image(
      iconBase64,
      "damanhour/lectures/icons",
      Date.now().toString()
    );
  }

  const lecture = await LectureModel.create({
    sub_name,
    level,
    department,
    num_of_week,
    title,
    icon: iconUrl,
  });

  return SuccessResponse(res, lecture, 201);
};

// ----------------------------------------------------------

export const uploadLecturePDF = async (req: Request, res: Response) => {
  const lecture = await LectureModel.findById(req.params.id);
  if (!lecture) throw new NotFound("Lecture not found");

  const files = req.files as Express.Multer.File[];
  if (!files?.length) throw new BadRequest("No PDF files uploaded");

  for (const file of files) {
    const pdfUrl = await uploadFileToCloudinary(file.path, "damanhour/lectures/pdfs", "auto");
    lecture.pdfs.push({
      name: file.originalname,
      url: pdfUrl,
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

  const videoUrl = await uploadFileToCloudinary(
    req.file.path,
    "damanhour/lectures/videos",
    "video"
  );

  lecture.video = {
    name: req.file.originalname,
    url: videoUrl,
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
