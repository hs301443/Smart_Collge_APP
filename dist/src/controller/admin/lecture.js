"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLecture = exports.updateLecture = exports.getLectureById = exports.getLectures = exports.uploadLectureVideo = exports.uploadLecturePDF = exports.createLecture = void 0;
const lecture_1 = require("../../models/shema/lecture");
const handleImages_1 = require("../../utils/handleImages");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const createLecture = async (req, res) => {
    const { sub_name, level, department, num_of_week, title, iconBase64 } = req.body;
    if (!sub_name || !title || !num_of_week) {
        throw new BadRequest_1.BadRequest("Required fields are missing");
    }
    let iconUrl = "";
    if (iconBase64 && iconBase64.startsWith("data:image")) {
        iconUrl = await (0, handleImages_1.saveBase64Image)(iconBase64, "damanhour/lectures/icons", Date.now().toString());
    }
    const lecture = await lecture_1.LectureModel.create({
        sub_name,
        level,
        department,
        num_of_week,
        title,
        icon: iconUrl,
    });
    return (0, response_1.SuccessResponse)(res, lecture, 201);
};
exports.createLecture = createLecture;
// ----------------------------------------------------------
const uploadLecturePDF = async (req, res) => {
    const lecture = await lecture_1.LectureModel.findById(req.params.id);
    if (!lecture)
        throw new Errors_1.NotFound("Lecture not found");
    const files = req.files;
    if (!files?.length)
        throw new BadRequest_1.BadRequest("No PDF files uploaded");
    for (const file of files) {
        const pdfUrl = await (0, handleImages_1.uploadFileToCloudinary)(file.path, "damanhour/lectures/pdfs", "auto");
        lecture.pdfs.push({
            name: file.originalname,
            url: pdfUrl,
        });
    }
    await lecture.save();
    return (0, response_1.SuccessResponse)(res, lecture);
};
exports.uploadLecturePDF = uploadLecturePDF;
// ----------------------------------------------------------
const uploadLectureVideo = async (req, res) => {
    const lecture = await lecture_1.LectureModel.findById(req.params.id);
    if (!lecture)
        throw new Errors_1.NotFound("Lecture not found");
    if (!req.file)
        throw new BadRequest_1.BadRequest("No video file uploaded");
    const videoUrl = await (0, handleImages_1.uploadFileToCloudinary)(req.file.path, "damanhour/lectures/videos", "video");
    lecture.video = {
        name: req.file.originalname,
        url: videoUrl,
        duration: 0,
        quality: "720p",
        uploadDate: new Date(),
    };
    await lecture.save();
    return (0, response_1.SuccessResponse)(res, lecture);
};
exports.uploadLectureVideo = uploadLectureVideo;
// ----------------------------------------------------------
const getLectures = async (req, res) => {
    const lectures = await lecture_1.LectureModel.find();
    return (0, response_1.SuccessResponse)(res, lectures);
};
exports.getLectures = getLectures;
// ----------------------------------------------------------
const getLectureById = async (req, res) => {
    const lecture = await lecture_1.LectureModel.findById(req.params.id);
    if (!lecture)
        throw new Errors_1.NotFound("Lecture not found");
    return (0, response_1.SuccessResponse)(res, lecture);
};
exports.getLectureById = getLectureById;
// ----------------------------------------------------------
const updateLecture = async (req, res) => {
    const lecture = await lecture_1.LectureModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lecture)
        throw new Errors_1.NotFound("Lecture not found");
    return (0, response_1.SuccessResponse)(res, lecture);
};
exports.updateLecture = updateLecture;
// ----------------------------------------------------------
const deleteLecture = async (req, res) => {
    const lecture = await lecture_1.LectureModel.findByIdAndDelete(req.params.id);
    if (!lecture)
        throw new Errors_1.NotFound("Lecture not found");
    return (0, response_1.SuccessResponse)(res, { message: "Lecture deleted" });
};
exports.deleteLecture = deleteLecture;
