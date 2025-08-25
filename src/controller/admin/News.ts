import { NewsModel } from "../../models/shema/News";
import { saveBase64Image } from "../../utils/handleImages";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";
import { UnauthorizedError } from "../../Errors";
import { Request, Response } from "express";


export const createNews = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Only admin can create news");

  const { title, content, type, event_link, event_date, images = [], optional = [], mainImageBase64, mainImage } = req.body;

  if (!title || !content || !type) throw new BadRequest("title, content and type are required");

  let finalMainImage = mainImage || "";
  if (mainImageBase64) {
    finalMainImage = await saveBase64Image(mainImageBase64, Date.now().toString(), req, "news");
  }

  if (!finalMainImage) throw new BadRequest("mainImage is required");

  const news = await NewsModel.create({
    title,
    content,
    type,
    mainImage: finalMainImage,
    images,
    optional,
    event_link,
    event_date,
  });

  return SuccessResponse(res, { news }, 201);
};

export const updateNews = async (req: Request, res: Response) => {
  if (!req.user ) throw new UnauthorizedError("Only admin can update news");

  const { id } = req.params;
  const news = await NewsModel.findById(id);
  if (!news) throw new NotFound("News not found");

  const { title, content, type, event_link, event_date, images, optional, mainImageBase64 } = req.body;

  if (title) news.title = title;
  if (content) news.content = content;
  if (type) news.type = type;
  if (event_link) news.event_link = event_link;
  if (event_date) news.event_date = event_date;
  if (images) news.images = images;
  if (optional) news.optional = optional;
  if (mainImageBase64) {
    news.mainImage = await saveBase64Image(mainImageBase64, news._id.toString(), req, "news");
  }

  await news.save();
  return SuccessResponse(res, { news }, 200);
};


export const deleteNews = async (req: Request, res: Response) => {
  if (!req.user ) throw new UnauthorizedError("Only admin can delete news");

  const { id } = req.params;
  const news = await NewsModel.findById(id);
  if (!news) throw new NotFound("News not found");

  await news.deleteOne();
  return SuccessResponse(res, { message: "News deleted successfully" }, 200);
};

export const getAllNews = async (req: Request, res: Response) => {
  if (!req.user ) throw new UnauthorizedError("Only admin can view news");

  const newsList = await NewsModel.find().sort({ createdAt: -1 });
  return SuccessResponse(res, { news: newsList }, 200);
};

export const getNewsById = async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError("Only admin can view news");

  const { id } = req.params;
  const news = await NewsModel.findById(id);
  if (!news) throw new NotFound("News not found");

  return SuccessResponse(res, { news }, 200);
};