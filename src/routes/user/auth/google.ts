import express from "express";
import passport from "passport";
import "../../../config/passport";
import { verifyGoogleToken } from "../../../config/passport";
import { googlevalidateSchema } from "../../../validation/user/auth";
import { validate } from "../../../middlewares/validation";
import { catchAsync } from "../../../utils/catchAsync";
const router = express.Router();

router.post( "/" ,validate(googlevalidateSchema) ,catchAsync(verifyGoogleToken))


export default router;