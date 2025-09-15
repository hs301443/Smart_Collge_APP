import { Router } from "express";
import AuthRoute from "./auth/index";
import NotificationRouter from './notification';
import NewsRouter from './News';
import StaticsRouter from "./Statics"
import templatesRouter from "./templates"
import chatRouter from "./chat";
import  ExamRouter  from "./Exam";
import QuestionRouter from './Question'
import AttemptRouter from './Attempt'
const route = Router();
route.use("/auth", AuthRoute);
route.use("/notification", NotificationRouter);
route.use("/news", NewsRouter);
route.use("/statics", StaticsRouter);
route.use("/templates", templatesRouter);
route.use("/chat",chatRouter);
route.use("/exam",ExamRouter)
route.use("/questions",QuestionRouter)
route.use("/attempt",AttemptRouter)
export default route;