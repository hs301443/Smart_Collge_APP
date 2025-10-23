"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewsById = exports.getAllNews = exports.deleteNews = exports.updateNews = exports.createNews = void 0;
const News_1 = require("../../models/shema/News");
const handleImages_1 = require("../../utils/handleImages");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const createNews = async (req, res) => {
    const { title, content, type, event_link, event_date, images = [], // صور إضافية
    optional = [], // ملفات إضافية (pdf, videos, ...)
    mainImageBase64, mainImage, } = req.body;
    if (!title || !content || !type)
        throw new BadRequest_1.BadRequest("title, content and type are required");
    // 🔹 حفظ الصورة الرئيسية
    let finalMainImage = mainImage || "";
    if (mainImageBase64) {
        finalMainImage = await (0, handleImages_1.saveBase64Image)(mainImageBase64, "news", Date.now().toString());
    }
    if (!finalMainImage)
        throw new BadRequest_1.BadRequest("mainImage is required");
    // 🔹 حفظ الصور الإضافية (images)
    const savedImages = [];
    for (const imgBase64 of images) {
        if (imgBase64.startsWith("data:")) {
            const imgUrl = await (0, handleImages_1.saveBase64Image)(imgBase64, "news/images", Date.now().toString());
            savedImages.push(imgUrl);
        }
        else {
            savedImages.push(imgBase64); // لو كانت URL جاهزة
        }
    }
    // 🔹 حفظ الملفات الإضافية (optional)
    const savedOptional = [];
    for (const fileBase64 of optional) {
        if (fileBase64.startsWith("data:")) {
            const fileUrl = await (0, handleImages_1.saveBase64Image)(fileBase64, "news/optional", Date.now().toString());
            savedOptional.push(fileUrl);
        }
        else {
            savedOptional.push(fileBase64); // لو كانت URL جاهزة
        }
    }
    // 🔹 إنشاء الخبر
    const news = await News_1.NewsModel.create({
        title,
        content,
        type,
        mainImage: finalMainImage,
        images: savedImages,
        optional: savedOptional,
        event_link,
        event_date,
    });
    return (0, response_1.SuccessResponse)(res, { news }, 201);
};
exports.createNews = createNews;
// ----------------------------------------------------------
const updateNews = async (req, res) => {
    const { id } = req.params;
    const news = await News_1.NewsModel.findById(id);
    if (!news)
        throw new Errors_1.NotFound("News not found");
    const { title, content, type, event_link, event_date, images = [], optional = [], mainImageBase64, mainImage, } = req.body;
    if (title)
        news.title = title;
    if (content)
        news.content = content;
    if (type)
        news.type = type;
    if (event_link)
        news.event_link = event_link;
    if (event_date)
        news.event_date = event_date;
    // 🔹 تحديث الصورة الرئيسية
    if (mainImageBase64) {
        news.mainImage = await (0, handleImages_1.saveBase64Image)(mainImageBase64, "news", news._id.toString());
    }
    else if (mainImage) {
        news.mainImage = mainImage;
    }
    // 🔹 تحديث الصور (images)
    if (images && images.length > 0) {
        const updatedImages = [];
        for (const img of images) {
            if (img.startsWith("data:")) {
                const url = await (0, handleImages_1.saveBase64Image)(img, "news/images", Date.now().toString());
                updatedImages.push(url);
            }
            else {
                updatedImages.push(img);
            }
        }
        news.images = updatedImages;
    }
    // 🔹 تحديث الملفات (optional)
    if (optional && optional.length > 0) {
        const updatedOptional = [];
        for (const file of optional) {
            if (file.startsWith("data:")) {
                const url = await (0, handleImages_1.saveBase64Image)(file, "news/optional", Date.now().toString());
                updatedOptional.push(url);
            }
            else {
                updatedOptional.push(file);
            }
        }
        news.optional = updatedOptional;
    }
    await news.save();
    return (0, response_1.SuccessResponse)(res, { news }, 200);
};
exports.updateNews = updateNews;
// ----------------------------------------------------------
const deleteNews = async (req, res) => {
    const { id } = req.params;
    const news = await News_1.NewsModel.findById(id);
    if (!news)
        throw new Errors_1.NotFound("News not found");
    await news.deleteOne();
    return (0, response_1.SuccessResponse)(res, { message: "News deleted successfully" }, 200);
};
exports.deleteNews = deleteNews;
// ----------------------------------------------------------
const getAllNews = async (req, res) => {
    const newsList = await News_1.NewsModel.find().sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, { news: newsList }, 200);
};
exports.getAllNews = getAllNews;
// ----------------------------------------------------------
const getNewsById = async (req, res) => {
    const { id } = req.params;
    const news = await News_1.NewsModel.findById(id);
    if (!news)
        throw new Errors_1.NotFound("News not found");
    return (0, response_1.SuccessResponse)(res, { news }, 200);
};
exports.getNewsById = getNewsById;
