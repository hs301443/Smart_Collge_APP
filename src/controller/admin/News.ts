import { NewsModel } from "../../models/shema/News";
import { saveBase64Image } from "../../utils/handleImages";
import { BadRequest } from "../../Errors/BadRequest";
import { SuccessResponse } from "../../utils/response";
import { NotFound } from "../../Errors";
import { Request, Response } from "express";

export const createNews = async (req: Request, res: Response) => {
  const {
    title,
    content,
    type,
    event_link,
    event_date,
    images = [], // صور إضافية
    optional = [], // ملفات إضافية (pdf, videos, ...)
    mainImageBase64,
    mainImage,
  } = req.body;

  if (!title || !content || !type)
    throw new BadRequest("title, content and type are required");

  // 🔹 حفظ الصورة الرئيسية
  let finalMainImage = mainImage || "";
  if (mainImageBase64) {
    finalMainImage = await saveBase64Image(
      mainImageBase64,
      "news",
      Date.now().toString()
    );
  }

  if (!finalMainImage) throw new BadRequest("mainImage is required");

  // 🔹 حفظ الصور الإضافية (images)
  const savedImages: string[] = [];
  for (const imgBase64 of images) {
    if (imgBase64.startsWith("data:")) {
      const imgUrl = await saveBase64Image(
        imgBase64,
        "news/images",
        Date.now().toString()
      );
      savedImages.push(imgUrl);
    } else {
      savedImages.push(imgBase64); // لو كانت URL جاهزة
    }
  }

  // 🔹 حفظ الملفات الإضافية (optional)
  const savedOptional: string[] = [];
  for (const fileBase64 of optional) {
    if (fileBase64.startsWith("data:")) {
      const fileUrl = await saveBase64Image(
        fileBase64,
        "news/optional",
        Date.now().toString()
      );
      savedOptional.push(fileUrl);
    } else {
      savedOptional.push(fileBase64); // لو كانت URL جاهزة
    }
  }

  // 🔹 إنشاء الخبر
  const news = await NewsModel.create({
    title,
    content,
    type,
    mainImage: finalMainImage,
    images: savedImages,
    optional: savedOptional,
    event_link,
    event_date,
  });

  return SuccessResponse(res, { news }, 201);
};

// ----------------------------------------------------------

export const updateNews = async (req: Request, res: Response) => {
  const { id } = req.params;
  const news = await NewsModel.findById(id);
  if (!news) throw new NotFound("News not found");

  const {
    title,
    content,
    type,
    event_link,
    event_date,
    images = [],
    optional = [],
    mainImageBase64,
    mainImage,
  } = req.body;

  if (title) news.title = title;
  if (content) news.content = content;
  if (type) news.type = type;
  if (event_link) news.event_link = event_link;
  if (event_date) news.event_date = event_date;

  // 🔹 تحديث الصورة الرئيسية
  if (mainImageBase64) {
    news.mainImage = await saveBase64Image(
      mainImageBase64,
      "news",
      news._id.toString()
    );
  } else if (mainImage) {
    news.mainImage = mainImage;
  }

  // 🔹 تحديث الصور (images)
  if (images && images.length > 0) {
    const updatedImages: string[] = [];
    for (const img of images) {
      if (img.startsWith("data:")) {
        const url = await saveBase64Image(
          img,
          "news/images",
          Date.now().toString()
        );
        updatedImages.push(url);
      } else {
        updatedImages.push(img);
      }
    }
    news.images = updatedImages;
  }

  // 🔹 تحديث الملفات (optional)
  if (optional && optional.length > 0) {
    const updatedOptional: string[] = [];
    for (const file of optional) {
      if (file.startsWith("data:")) {
        const url = await saveBase64Image(
          file,
          "news/optional",
          Date.now().toString()
        );
        updatedOptional.push(url);
      } else {
        updatedOptional.push(file);
      }
    }
    news.optional = updatedOptional;
  }

  await news.save();
  return SuccessResponse(res, { news }, 200);
};

// ----------------------------------------------------------

export const deleteNews = async (req: Request, res: Response) => {
  const { id } = req.params;
  const news = await NewsModel.findById(id);
  if (!news) throw new NotFound("News not found");

  await news.deleteOne();
  return SuccessResponse(res, { message: "News deleted successfully" }, 200);
};

// ----------------------------------------------------------

export const getAllNews = async (req: Request, res: Response) => {
  const newsList = await NewsModel.find().sort({ createdAt: -1 });
  return SuccessResponse(res, { news: newsList }, 200);
};

// ----------------------------------------------------------

export const getNewsById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const news = await NewsModel.findById(id);
  if (!news) throw new NotFound("News not found");

  return SuccessResponse(res, { news }, 200);
};
