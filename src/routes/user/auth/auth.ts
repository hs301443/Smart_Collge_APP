import { Router } from 'express';
import { signup,completeProfileStudent ,verifyEmail, login,resetPassword,verifyResetCode,sendResetCode, getFcmToken, completeProfile,updateProfileImage,getProfile,deleteAccount} from '../../../controller/users/auth';
import { validate } from '../../../middlewares/validation';
import { authenticated } from '../../../middlewares/authenticated';
import { catchAsync } from '../../../utils/catchAsync';
import { checkResetCodeSchema, loginSchema, resetPasswordSchema, sendResetCodeSchema, signupSchema, verifyEmailSchema} from '../../../validation/user/auth';

const route = Router();

route.post("/signup", validate(signupSchema), catchAsync(signup));
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
route.delete("/delete",authenticated, catchAsync(deleteAccount));


export default route;
