import { Router } from 'express';
import { signup,completeProfileStudent ,verifyEmail, login,resetPassword,verifyResetCode,sendResetCode, getFcmToken, completeProfile,updateProfileImage,getProfile,deleteProfile,updateProfile} from '../../../controller/users/auth';
import { validate } from '../../../middlewares/validation';
import { authenticated } from '../../../middlewares/authenticated';
import { catchAsync } from '../../../utils/catchAsync';
import { checkResetCodeSchema, loginSchema, resetPasswordSchema, sendResetCodeSchema, signupSchema, verifyEmailSchema} from '../../../validation/user/auth';
 import { uploadPDF } from '../../../utils/multer';
const route = Router();

route.post("/signup", validate(signupSchema),uploadPDF.single("cv") ,catchAsync(signup));
route.post("/login", validate(loginSchema), catchAsync(login));
route.post(
  "/verify-email",
  validate(verifyEmailSchema),
  catchAsync(verifyEmail)
);
route.post("/forgot-password", validate(sendResetCodeSchema), sendResetCode);
route.post("/verify-code", validate(checkResetCodeSchema), catchAsync(verifyResetCode));
route.post("/reset-password", validate(resetPasswordSchema), resetPassword);
route.post("/fcm-token",authenticated ,catchAsync(getFcmToken));
route.post("/complete" ,catchAsync(completeProfile))
route.patch("/update-image",authenticated ,catchAsync(updateProfileImage))
route.post("/complete-student",authenticated,catchAsync(completeProfileStudent))
route.get("/profile",authenticated, catchAsync(getProfile));
route.delete("/delete",authenticated, catchAsync(deleteProfile));
route.put("/update",authenticated, uploadPDF.single("cv") ,catchAsync(updateProfile));


export default route;
