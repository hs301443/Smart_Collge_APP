import { Router } from "express";
import userRouter from './user/index';
import adminRouter from './admin/index';
import OpinAiRouter from './OpinAi';
const route = Router();

route.use('/admin', adminRouter);

route.use('/user', userRouter);
route.use('/openai', OpinAiRouter);

export default route;