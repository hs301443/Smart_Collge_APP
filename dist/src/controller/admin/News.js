"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewsById = exports.getAllNews = exports.deleteNews = exports.updateNews = exports.createNews = void 0;
const News_1 = require("../../models/shema/News");
const handleImages_1 = require("../../utils/handleImages");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const createNews = async (req, res) => {
    const { title, content, type, event_link, event_date, images = [], optional = [], mainImageBase64, mainImage } = req.body;
    if (!title || !content || !type)
        throw new BadRequest_1.BadRequest("title, content and type are required");
    let finalMainImage = mainImage || "";
    if (mainImageBase64) {
        finalMainImage = await (0, handleImages_1.saveBase64Image)(mainImageBase64, Date.now().toString(), req, "news");
    }
    if (!finalMainImage)
        throw new BadRequest_1.BadRequest("mainImage is required");
    const news = await News_1.NewsModel.create({
        title,
        content,
        type,
        mainImage: finalMainImage,
        images,
        optional,
        event_link,
        event_date,
    });
    return (0, response_1.SuccessResponse)(res, { news }, 201);
};
exports.createNews = createNews;
const updateNews = async (req, res) => {
    const { id } = req.params;
    const news = await News_1.NewsModel.findById(id);
    if (!news)
        throw new Errors_1.NotFound("News not found");
    const { title, content, type, event_link, event_date, images, optional, mainImageBase64 } = req.body;
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
    if (images)
        news.images = images;
    if (optional)
        news.optional = optional;
    if (mainImageBase64) {
        news.mainImage = await (0, handleImages_1.saveBase64Image)(mainImageBase64, news._id.toString(), req, "news");
    }
    await news.save();
    return (0, response_1.SuccessResponse)(res, { news }, 200);
};
exports.updateNews = updateNews;
const deleteNews = async (req, res) => {
    const { id } = req.params;
    const news = await News_1.NewsModel.findById(id);
    if (!news)
        throw new Errors_1.NotFound("News not found");
    await news.deleteOne();
    return (0, response_1.SuccessResponse)(res, { message: "News deleted successfully" }, 200);
};
exports.deleteNews = deleteNews;
const getAllNews = async (req, res) => {
    const newsList = await News_1.NewsModel.find().sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, { news: newsList }, 200);
};
exports.getAllNews = getAllNews;
const getNewsById = async (req, res) => {
    const { id } = req.params;
    const news = await News_1.NewsModel.findById(id);
    if (!news)
        throw new Errors_1.NotFound("News not found");
    return (0, response_1.SuccessResponse)(res, { news }, 200);
};
exports.getNewsById = getNewsById;
