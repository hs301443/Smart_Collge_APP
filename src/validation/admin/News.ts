import Joi from "joi";

export const createNewsSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(10).required(),
  mainImage: Joi.string().uri().required(),
  images: Joi.array().items(Joi.string().uri()).default([]),
optional: Joi.array().items(Joi.string()),
  event_link: Joi.string().uri().optional(),
  event_date: Joi.date().optional(),
  type: Joi.string().valid("news", "event", "announcement").required(),
});

export const updateNewsSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  content: Joi.string().min(10),
  mainImage: Joi.string().uri(),
  images: Joi.array().items(Joi.string().uri()),
optional: Joi.array().items(Joi.string()),
  event_link: Joi.string().uri(),
  event_date: Joi.date(),
  type: Joi.string().valid("news", "event", "announcement"),
});