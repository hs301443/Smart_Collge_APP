import { Router } from "express";
import AuthRoute from "./auth/index";
import NotificationRouter from './notification';
import NewsRouter from './News';
import StaticsRouter from "./Statics"
import templatesRouter from "./templates"
import  ExamRouter  from "./Exam";
import chatrouter from "./chat"

const route = Router();
route.use("/auth", AuthRoute);
route.use("/notification", NotificationRouter);
route.use("/news", NewsRouter);
route.use("/statics", StaticsRouter);
route.use("/templates", templatesRouter);
route.use("/exam",ExamRouter)
route.use("/chat",chatrouter)
export default route;