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
    if (iconBase64) {
        iconUrl = await (0, handleImages_1.saveBase64Image)(iconBase64, Date.now().toString(), req, "lectures/icons");
    }
    const lecture = new lecture_1.LectureModel({
        sub_name,
        level,
        department,
        num_of_week,
        title,
        icon: iconUrl,
    });
    await lecture.save();
    return (0, response_1.SuccessResponse)(res, lecture, 201);
};
exports.createLecture = createLecture;
const uploadLecturePDF = async (req, res) => {
    const lecture = await lecture_1.LectureModel.findById(req.params.id);
    if (!lecture)
        throw new Errors_1.NotFound("Lecture not found");
    if (!req.file)
        throw new BadRequest_1.BadRequest("No PDF file uploaded");
    lecture.pdfs.push({
        name: req.file.originalname,
        url: `${req.protocol}://${req.get("host")}/uploads/pdfs/${req.file.filename}`,
    });
    await lecture.save();
    return (0, response_1.SuccessResponse)(res, lecture);
};
exports.uploadLecturePDF = uploadLecturePDF;
const uploadLectureVideo = async (req, res) => {
    try {
        const lecture = await lecture_1.LectureModel.findById(req.params.id);
        if (!lecture)
            throw new Errors_1.NotFound("Lecture not found");
        if (!req.file)
            throw new BadRequest_1.BadRequest("No video file uploaded");
        lecture.video = {
            name: req.file.originalname,
            url: `${req.protocol}://${req.get("host")}/uploads/videos/${req.file.filename}`,
            duration: 0, // default
            quality: "720p", // default
            uploadDate: new Date() // default
        };
        await lecture.save();
        return (0, response_1.SuccessResponse)(res, lecture);
    }
    catch (error) {
        return res.status(error.statusCode || 500).json({ error: error.message });
    }
};
exports.uploadLectureVideo = uploadLectureVideo;
const getLectures = async (req, res) => {
    const lectures = await lecture_1.LectureModel.find();
    return (0, response_1.SuccessResponse)(res, lectures);
};
exports.getLectures = getLectures;
const getLectureById = async (req, res) => {
    const lecture = await lecture_1.LectureModel.findById(req.params.id);
    if (!lecture)
        throw new Errors_1.NotFound("Lecture not found");
    return (0, response_1.SuccessResponse)(res, lecture);
};
exports.getLectureById = getLectureById;
const updateLecture = async (req, res) => {
    const lecture = await lecture_1.LectureModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lecture)
        throw new Errors_1.NotFound("Lecture not found");
    return (0, response_1.SuccessResponse)(res, lecture);
};
exports.updateLecture = updateLecture;
const deleteLecture = async (req, res) => {
    const lecture = await lecture_1.LectureModel.findByIdAndDelete(req.params.id);
    if (!lecture)
        throw new Errors_1.NotFound("Lecture not found");
    return (0, response_1.SuccessResponse)(res, { message: "Lecture deleted" });
};
exports.deleteLecture = deleteLecture;
