import Joi from "joi";

export const signupSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("Student","Graduated").required(),
  imageBase64: Joi.string().optional(),
   graduatedData: Joi.object({
    cv: Joi.string().optional(),
    employment_status: Joi.string().valid("Employed","Job Seeker","Freelancer","Postgraduate Studies").optional(),
    job_title: Joi.string().optional(),
    company_location: Joi.string().optional(),
    company_email: Joi.string().optional(),
    company_link: Joi.string().optional(),
    company_phone: Joi.string().optional(),
    about_company: Joi.string().optional(),
  }).optional()
});
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const verifyEmailSchema = Joi.object({
  userId: Joi.string().required(),
  code: Joi.string().required(),
});

export const sendResetCodeSchema = Joi.object({
  email: Joi.string().email().required(),
}); 

export const checkResetCodeSchema = Joi.object({
  userId: Joi.string().required(),
  code: Joi.string().required(),
});

export const resetPasswordSchema = Joi.object({
  userId: Joi.string().required(),
  newPassword: Joi.string().min(6).max(30).required(),
}); 

