import { Request, Response } from "express";
import { LectureModel } from "../../models/shema/lecture";
import { saveBase64Image } from "../../utils/handleImages";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

export const createLecture = async (req: Request, res: Response) => {
    const { sub_name, level, department, num_of_week, title, iconBase64 } = req.body;

    if (!sub_name || !title || !num_of_week) {
      throw new BadRequest("Required fields are missing");
    }

    let iconUrl = "";
    if (iconBase64) {
      iconUrl = await saveBase64Image(
        iconBase64,
        Date.now().toString(),
        req,
        "lectures/icons"
      );
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

export const uploadLecturePDF = async (req: Request, res: Response) => {
    const lecture = await LectureModel.findById(req.params.id);
    if (!lecture) throw new NotFound("Lecture not found");

    if (!req.file) throw new BadRequest("No PDF file uploaded");

    lecture.pdfs.push({
      name: req.file.originalname,
      url: `${req.protocol}://${req.get("host")}/uploads/pdfs/${req.file.filename}`,
    });

    await lecture.save();
    return SuccessResponse(res, lecture);
 
};

export const uploadLectureVideo = async (req: Request, res: Response) => {
  try {
    const lecture = await LectureModel.findById(req.params.id);
    if (!lecture) throw new NotFound("Lecture not found");

    if (!req.file) throw new BadRequest("No video file uploaded");

    lecture.video = {
      name: req.file.originalname,
      url: `${req.protocol}://${req.get("host")}/uploads/videos/${req.file.filename}`,
      duration: 0,             // default
      quality: "720p",         // default
      uploadDate: new Date()   // default
    };

    await lecture.save();
    return SuccessResponse(res, lecture);
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getLectures = async (req: Request, res: Response) => {
    const lectures = await LectureModel.find();
    return SuccessResponse(res, lectures);
 
};

export const getLectureById = async (req: Request, res: Response) => {
 
    const lecture = await LectureModel.findById(req.params.id);
    if (!lecture) throw new NotFound("Lecture not found");
    return SuccessResponse(res, lecture);
  
};

export const updateLecture = async (req: Request, res: Response) => {
    const lecture = await LectureModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lecture) throw new NotFound("Lecture not found");
    return SuccessResponse(res, lecture);
  
};

export const deleteLecture = async (req: Request, res: Response) => {
    const lecture = await LectureModel.findByIdAndDelete(req.params.id);
    if (!lecture) throw new NotFound("Lecture not found");
    return SuccessResponse(res, { message: "Lecture deleted" });
  
};
