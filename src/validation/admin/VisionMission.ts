import Joi from "joi";

export const visionMissionSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  imageBase64: Joi.string().optional(),
  
});

export const visionMissionUpdateSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  imageBase64: Joi.string().optional(),
});