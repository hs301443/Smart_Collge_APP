import Joi from "joi";

export const createnotificationSchema = Joi.object({
  title: Joi.string().required(),
  body: Joi.string().required(),
});

export const updatenotificationSchema = Joi.object({
  title: Joi.string().optional(),
  body: Joi.string().optional(),
});